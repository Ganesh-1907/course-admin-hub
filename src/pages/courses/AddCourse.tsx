import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { createCourse, getCourseById, updateCourse } from "@/services/api";

const serviceTypes = ["Agile", "Service", "SAFe", "Project", "Quality", "Business", "Generative AI"];
const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Spanish"];
const batchTypes = ["Weekend", "Weekdays"];
const courseTypes = ["Online", "Offline"];

const countryConfigs = [
    { country: "USA", currency: "USD", symbol: "$" },
    { country: "Canadian", currency: "CAD", symbol: "C$" },
    { country: "Europe", currency: "EUR", symbol: "€" },
    { country: "India", currency: "INR", symbol: "₹" },
    { country: "Australia", currency: "AUD", symbol: "A$" },
    { country: "Singapore", currency: "SGD", symbol: "S$" }
];

interface CountryPricing {
  country: string;
  currency: string;
  fee: string;
  discount: string;
  price: string;
}

const AddCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mentor: "",
    serviceType: "",
    difficultyLevel: "",
    isActive: true,
    startDate: "",
    endDate: "",
    duration: "",
    language: "English",
    startTime: "",
    endTime: "",
    batchType: "",
    courseType: "",
    address: "",
    countryPricing: countryConfigs.map(c => ({
      country: c.country,
      currency: c.currency,
      fee: "",
      discount: "0",
      price: "0.00"
    })) as CountryPricing[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getCourseById(id);
        if (response.success && response.data) {
          const course = response.data;
          
          let cPricing = countryConfigs.map(c => ({
            country: c.country,
            currency: c.currency,
            fee: "",
            discount: "0",
            price: "0.00"
          }));

          if (course.countryPricing && course.countryPricing.length > 0) {
             cPricing = countryConfigs.map(config => {
                const existing = course.countryPricing.find((cp: any) => cp.country === config.country);
                if (existing) {
                    return {
                        country: existing.country,
                        currency: existing.currency || config.currency,
                        fee: String(existing.price),
                        discount: String(existing.discountPercentage),
                        price: String(existing.finalPrice)
                    };
                }
                return { 
                    country: config.country, 
                    currency: config.currency, 
                    fee: "", 
                    discount: "0", 
                    price: "0.00" 
                };
             });
          }

          setFormData({
            title: course.courseName || "",
            description: course.description || "",
            mentor: course.mentor || "",
            serviceType: course.serviceType || "",
            difficultyLevel: course.difficultyLevel || "",
            isActive: course.isActive ?? true,
            startDate: course.startDate ? new Date(course.startDate).toISOString().slice(0, 10) : "",
            endDate: course.endDate ? new Date(course.endDate).toISOString().slice(0, 10) : "",
            duration: course.duration ? String(course.duration) : "",
            language: course.language || "English",
            startTime: course.startTime || "",
            endTime: course.endTime || "",
            batchType: course.batchType || "",
            courseType: course.courseType || "",
            address: course.address || "",
            countryPricing: cPricing
          });
        } else {
          toast.error(response.message || "Failed to load course");
          navigate("/courses");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load course");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  const handlePricingChange = (index: number, field: keyof CountryPricing, value: string) => {
    const newPricing = [...formData.countryPricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    
    if (field === 'fee' || field === 'discount') {
        const fee = parseFloat(newPricing[index].fee) || 0;
        const discount = parseFloat(newPricing[index].discount) || 0;
        const price = fee - (fee * discount / 100);
        newPricing[index].price = price.toFixed(2);
    }

    setFormData({ ...formData, countryPricing: newPricing });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Course name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.mentor) newErrors.mentor = "Mentor name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.serviceType) newErrors.serviceType = "Service type is required";
    if (!formData.difficultyLevel) newErrors.difficultyLevel = "Difficulty level is required";
    
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.batchType) newErrors.batchType = "Batch type is required";
    if (!formData.courseType) newErrors.courseType = "Course type is required";
    if (formData.courseType === 'Offline' && !formData.address) newErrors.address = "Address is required for offline courses";

    const hasPricing = formData.countryPricing.some(p => p.fee && parseFloat(p.fee) > 0);
    if (!hasPricing) newErrors.pricing = "At least one country pricing is required";

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        toast.error("Please fill in all required fields correctly.");
        return;
    }

    setLoading(true);
    try {
      const defaultPricing = formData.countryPricing.find(p => p.country === 'USA') || formData.countryPricing[0];

      const payload = {
        courseName: formData.title,
        description: formData.description,
        mentor: formData.mentor,
        serviceType: formData.serviceType,
        difficultyLevel: formData.difficultyLevel,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: parseInt(formData.duration),
        language: formData.language,
        startTime: formData.startTime,
        endTime: formData.endTime,
        batchType: formData.batchType,
        courseType: formData.courseType,
        address: formData.courseType === 'Offline' ? formData.address : undefined,
        countryPricing: formData.countryPricing.map(p => ({
            country: p.country,
            currency: p.currency,
            price: parseFloat(p.fee) || 0,
            discountPercentage: parseFloat(p.discount) || 0,
            finalPrice: parseFloat(p.price) || 0
        })),
        price: parseFloat(defaultPricing.fee) || 0,
        discountPercentage: parseFloat(defaultPricing.discount) || 0,
      };

      const response = isEditMode && id
        ? await updateCourse(id, payload)
        : await createCourse(payload);

      if (response.success) {
        toast.success(isEditMode ? "Course updated successfully!" : "Course created successfully!");
        navigate("/courses");
      } else {
        toast.error(response.message || "Failed to save course");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">{isEditMode ? "Edit Course" : "Add New Course"}</h1>
          <p className="page-subtitle">
            {isEditMode ? "Update course details" : "Create a new course for your students"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="title" className="form-label">Course Name *</Label>
                <Input
                  id="title"
                  className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course name"
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="mentor" className="form-label">Mentor Name *</Label>
                <Input
                  id="mentor"
                  className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                  value={formData.mentor}
                  onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                  placeholder="Enter mentor name"
                />
                {errors.mentor && <p className="text-destructive text-sm mt-1">{errors.mentor}</p>}
              </div>

              <div>
               <Label htmlFor="language" className="form-label">Language *</Label>
               <Select
                 value={formData.language}
                 onValueChange={(value) => setFormData({ ...formData, language: value })}
               >
                 <SelectTrigger className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary">
                   <SelectValue placeholder="Select language" />
                 </SelectTrigger>
                 <SelectContent className="bg-card border-border">
                   {languages.map((lang) => (
                     <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <Label htmlFor="description" className="form-label">Description *</Label>
              <Textarea
                id="description"
                className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter course description"
                rows={4}
              />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
            </div>
            
            {/* Row 3: Class & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="serviceType" className="form-label">Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceType && <p className="text-destructive text-sm mt-1">{errors.serviceType}</p>}
              </div>

              <div>
                <Label htmlFor="difficultyLevel" className="form-label">Difficulty Level *</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
                >
                  <SelectTrigger className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficultyLevel && <p className="text-destructive text-sm mt-1">{errors.difficultyLevel}</p>}
              </div>

              <div>
                <Label htmlFor="courseType" className="form-label">Course Type *</Label>
                <Select
                  value={formData.courseType}
                  onValueChange={(value) => setFormData({ ...formData, courseType: value })}
                >
                  <SelectTrigger className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {courseTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseType && <p className="text-destructive text-sm mt-1">{errors.courseType}</p>}
              </div>
            </div>

            {formData.courseType === 'Offline' && (
                <div>
                    <Label htmlFor="address" className="form-label">Address *</Label>
                    <Textarea 
                        id="address" 
                        className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address for offline course"
                        rows={2}
                    />
                    {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
                </div>
            )}

            {/* Row 4: Batch & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                <Label htmlFor="batchType" className="form-label">Batch Type *</Label>
                <Select
                  value={formData.batchType}
                  onValueChange={(value) => setFormData({ ...formData, batchType: value })}
                >
                  <SelectTrigger className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select batch type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {batchTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batchType && <p className="text-destructive text-sm mt-1">{errors.batchType}</p>}
              </div>

              <div>
                <Label htmlFor="startDate" className="form-label">Start Date *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-10 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate" className="form-label">End Date *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-10 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Row 5: Time & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <Label htmlFor="startTime" className="form-label">Start Time *</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="startTime"
                            type="time"
                            className="pl-10 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                    </div>
                    {errors.startTime && <p className="text-destructive text-sm mt-1">{errors.startTime}</p>}
                 </div>
                 <div>
                    <Label htmlFor="endTime" className="form-label">End Time *</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="endTime"
                            type="time"
                            className="pl-10 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                     </div>
                    {errors.endTime && <p className="text-destructive text-sm mt-1">{errors.endTime}</p>}
                 </div>
                 <div>
                    <Label htmlFor="duration" className="form-label">Duration (days) *</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        className="rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="30"
                    />
                    {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
                </div>
            </div>

            {/* Row 6: Status & Address */}
             <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-card/50">
                <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-base font-medium">Course Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this to make the course visible to students and allow new enrollments.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(value) => setFormData({ ...formData, isActive: value })}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer font-medium min-w-[3.5rem] text-right">
                        {formData.isActive ? "Active" : "Inactive"}
                    </Label>
                </div>
             </div>




          {/* Pricing Section - Only this maintains a header and slight separation if needed, but styling kept flat */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold">Pricing by Region</h3>
            <p className="text-sm text-muted-foreground mb-4">Set fee and discount for each supported region with their respective currencies.</p>
            
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted">
                            <TableHead className="font-semibold text-foreground border">Country/Region</TableHead>
                            <TableHead className="font-semibold text-foreground border">Currency</TableHead>
                            <TableHead className="font-semibold text-foreground border">Fee</TableHead>
                            <TableHead className="font-semibold text-foreground border">Discount (%)</TableHead>
                            <TableHead className="font-semibold text-foreground border">Final Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formData.countryPricing.map((item, index) => {
                            const config = countryConfigs.find(c => c.country === item.country);
                            const symbol = config ? config.symbol : "";
                            return (
                            <TableRow key={item.country}>
                                <TableCell className="font-medium border">{item.country}</TableCell>
                                <TableCell className="text-muted-foreground border">{item.currency}</TableCell>
                                <TableCell className="border">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground text-sm font-medium w-6 text-right">{symbol}</span>
                                        <Input 
                                            type="number" 
                                            placeholder="0.00"
                                            min="0"
                                            value={item.fee}
                                            onChange={(e) => handlePricingChange(index, 'fee', e.target.value)}
                                            className="w-32 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="border">
                                    <Input 
                                        type="number" 
                                        placeholder="0"
                                        min="0" 
                                        max="100"
                                        value={item.discount}
                                        onChange={(e) => handlePricingChange(index, 'discount', e.target.value)}
                                        className="w-32 rounded-lg border-input focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </TableCell>
                                <TableCell className="border">
                                    <span className="font-semibold text-primary">
                                        {symbol} : {item.price ? `${item.price}` : '0.00'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </div>
            {errors.pricing && <p className="text-destructive text-sm mt-1">{errors.pricing}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/courses")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Course" : "Create Course")}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
