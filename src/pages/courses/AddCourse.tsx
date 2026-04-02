import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  createCourse,
  getCourseById,
  getCourseCatalog,
  getMentorsByCourse,
  updateCourse,
} from "@/services/api";

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Hindi", "Spanish"];
const batchTypes = ["WEEKEND", "WEEKDAY", "FAST TRACK"];
const courseTypes = ["ONLINE", "OFFLINE"];

const countryConfigs = [
  { country: "USA", currency: "USD", symbol: "$" },
  { country: "Canada", currency: "CAD", symbol: "C$" },
  { country: "Europe", currency: "EUR", symbol: "EUR" },
  { country: "India", currency: "INR", symbol: "Rs" },
  { country: "Australia", currency: "AUD", symbol: "A$" },
  { country: "Singapore", currency: "SGD", symbol: "S$" },
];

interface CountryPricing {
  country: string;
  currency: string;
  fee: string;
  discount: string;
  price: string;
}

interface CourseOption {
  id: number;
  name: string;
  serviceType: string;
}

interface MentorOption {
  id: number;
  name: string;
  specialization?: string;
  designation?: string;
  rating?: number | null;
  yearsOfExperience?: number | null;
  photoUrl?: string;
}

const buildDefaultPricing = (): CountryPricing[] => countryConfigs.map((config) => ({
  country: config.country,
  currency: config.currency,
  fee: "",
  discount: "0",
  price: "0.00",
}));

const AddCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [existingBrochure, setExistingBrochure] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseId: "",
    mentorId: "",
    description: "",
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
    countryPricing: buildDefaultPricing(),
  });

  const selectedCourse = courseOptions.find((course) => String(course.id) === formData.courseId) || null;
  const selectedMentor = mentorOptions.find((mentor) => String(mentor.id) === formData.mentorId) || null;

  const loadMentors = async (courseId: string, preferredMentorId?: string) => {
    if (!courseId) {
      setMentorOptions([]);
      setFormData((prev) => ({ ...prev, mentorId: "" }));
      return;
    }

    setMentorLoading(true);
    try {
      const response = await getMentorsByCourse(courseId);
      const options: MentorOption[] = response.success ? (response.data || []) : [];
      setMentorOptions(options);

      if (preferredMentorId && options.some((mentor) => String(mentor.id) === preferredMentorId)) {
        setFormData((prev) => ({ ...prev, mentorId: preferredMentorId }));
      } else {
        setFormData((prev) => ({
          ...prev,
          mentorId: options.some((mentor) => String(mentor.id) === prev.mentorId) ? prev.mentorId : "",
        }));
      }
    } catch (error) {
      setMentorOptions([]);
      setFormData((prev) => ({ ...prev, mentorId: "" }));
      toast.error(error instanceof Error ? error.message : "Failed to load mentors");
    } finally {
      setMentorLoading(false);
    }
  };

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const response = await getCourseCatalog();
        if (response.success) {
          setCourseOptions(response.data || []);
        } else {
          toast.error(response.message || "Failed to load course catalog");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load course catalog");
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    if (!formData.courseId) {
      setMentorOptions([]);
      setFormData((prev) => ({ ...prev, serviceType: "" }));
      return;
    }

    const serviceType = selectedCourse?.serviceType || "";
    setFormData((prev) => (prev.serviceType === serviceType ? prev : { ...prev, serviceType }));
    loadMentors(formData.courseId);
  }, [formData.courseId, selectedCourse?.serviceType]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await getCourseById(id);
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load schedule");
        }

        const schedule = response.data;
        const formattedPricing = buildDefaultPricing().map((config) => {
          const existing = schedule.countryPricing?.find((item: any) => item.country === config.country);
          if (!existing) return config;
          return {
            country: existing.country,
            currency: existing.currency || config.currency,
            fee: String(existing.price ?? ""),
            discount: String(existing.discountPercentage ?? 0),
            price: String(existing.finalPrice ?? 0),
          };
        });

        setFormData({
          courseId: String(schedule.courseId || ""),
          mentorId: String(schedule.mentorId || ""),
          description: schedule.description || "",
          serviceType: schedule.serviceType || "",
          difficultyLevel: schedule.difficultyLevel || "",
          isActive: schedule.isActive ?? true,
          startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().slice(0, 10) : "",
          endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().slice(0, 10) : "",
          duration: schedule.duration ? String(schedule.duration) : "",
          language: schedule.language || "English",
          startTime: schedule.startTime || "",
          endTime: schedule.endTime || "",
          batchType: schedule.batchType || "",
          courseType: schedule.courseType || "",
          address: schedule.address || "",
          countryPricing: formattedPricing,
        });

        setExistingBrochure(schedule.brochure?.url || schedule.brochureUrl || null);

        if (schedule.courseId) {
          await loadMentors(String(schedule.courseId), String(schedule.mentorId || ""));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load schedule");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, navigate]);

  const handlePricingChange = (index: number, field: keyof CountryPricing, value: string) => {
    const nextPricing = [...formData.countryPricing];
    nextPricing[index] = { ...nextPricing[index], [field]: value };

    if (field === "fee" || field === "discount") {
      const fee = parseFloat(nextPricing[index].fee) || 0;
      const discount = parseFloat(nextPricing[index].discount) || 0;
      const finalPrice = fee - (fee * discount) / 100;
      nextPricing[index].price = finalPrice.toFixed(2);
    }

    setFormData((prev) => ({ ...prev, countryPricing: nextPricing }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.courseId) nextErrors.courseId = "Course selection is required";
    if (!formData.mentorId) nextErrors.mentorId = "Mentor selection is required";
    if (!formData.description) nextErrors.description = "Description is required";
    if (!formData.startDate) nextErrors.startDate = "Start date is required";
    if (!formData.endDate) nextErrors.endDate = "End date is required";
    if (!formData.duration) nextErrors.duration = "Duration is required";
    if (!formData.difficultyLevel) nextErrors.difficultyLevel = "Difficulty level is required";
    if (!formData.startTime) nextErrors.startTime = "Start time is required";
    if (!formData.endTime) nextErrors.endTime = "End time is required";
    if (!formData.batchType) nextErrors.batchType = "Batch type is required";
    if (!formData.courseType) nextErrors.courseType = "Course type is required";
    if (formData.courseType === "OFFLINE" && !formData.address) nextErrors.address = "Address is required for offline batches";

    const hasPricing = formData.countryPricing.some((pricing) => pricing.fee && parseFloat(pricing.fee) > 0);
    if (!hasPricing) nextErrors.pricing = "At least one pricing row is required";

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      nextErrors.endDate = "End date must be after start date";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("courseId", formData.courseId);
      payload.append("mentorId", formData.mentorId);
      payload.append("description", formData.description);
      payload.append("difficultyLevel", formData.difficultyLevel);
      payload.append("isActive", String(formData.isActive));
      payload.append("startDate", formData.startDate);
      payload.append("endDate", formData.endDate);
      payload.append("duration", formData.duration);
      payload.append("language", formData.language);
      payload.append("startTime", formData.startTime);
      payload.append("endTime", formData.endTime);
      payload.append("batchType", formData.batchType);
      payload.append("courseType", formData.courseType);

      if (formData.courseType === "OFFLINE") {
        payload.append("address", formData.address);
      }

      const pricingData = formData.countryPricing.map((pricing) => ({
        country: pricing.country,
        currency: pricing.currency,
        price: parseFloat(pricing.fee) || 0,
        discountPercentage: parseFloat(pricing.discount) || 0,
        finalPrice: parseFloat(pricing.price) || 0,
      }));

      payload.append("countryPricing", JSON.stringify(pricingData));

      if (brochureFile) {
        payload.append("brochure", brochureFile);
      }

      const response = isEditMode && id
        ? await updateCourse(id, payload)
        : await createCourse(payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to save schedule");
      }

      toast.success(isEditMode ? "Schedule updated successfully!" : "Schedule created successfully!");
      navigate("/courses");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">{isEditMode ? "Edit Schedule" : "Add New Schedule"}</h1>
          <p className="page-subtitle">
            Choose a course, then assign only the mentors mapped to that course.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="form-label">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, courseId: value, mentorId: "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={catalogLoading ? "Loading courses..." : "Select course"} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-80">
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && <p className="text-destructive text-sm mt-1">{errors.courseId}</p>}
            </div>

            <div>
              <Label className="form-label">Mapped Mentor *</Label>
              <Select
                value={formData.mentorId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, mentorId: value }))}
                disabled={!formData.courseId || mentorLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={mentorLoading ? "Loading mentors..." : "Select mentor"} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-80">
                  {mentorOptions.map((mentor) => (
                    <SelectItem key={mentor.id} value={String(mentor.id)}>
                      {mentor.name} {mentor.specialization ? `• ${mentor.specialization}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mentorId && <p className="text-destructive text-sm mt-1">{errors.mentorId}</p>}
            </div>

            <div>
              <Label className="form-label">Service Type</Label>
              <Input value={selectedCourse?.serviceType || formData.serviceType} disabled />
            </div>
          </div>

          {selectedMentor && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">{selectedMentor.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedMentor.designation || "Mentor"} {selectedMentor.specialization ? `• ${selectedMentor.specialization}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMentor.yearsOfExperience ? `${selectedMentor.yearsOfExperience}+ years experience` : "Experienced instructor"}
                {selectedMentor.rating ? ` • ${selectedMentor.rating.toFixed(1)} rating` : ""}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="description" className="form-label">Schedule Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[120px]"
              placeholder="Describe the batch, audience, or delivery context"
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="form-label">Difficulty *</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, difficultyLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
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
              <Label className="form-label">Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="form-label">Duration *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(event) => setFormData((prev) => ({ ...prev, duration: event.target.value }))}
                placeholder="Days"
              />
              {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 mt-6 md:mt-0">
              <div>
                <p className="text-sm font-medium">Active schedule</p>
                <p className="text-xs text-muted-foreground">Control public visibility</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="startDate" className="form-label">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))}
              />
              {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <Label htmlFor="endDate" className="form-label">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, endDate: event.target.value }))}
              />
              {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <Label className="form-label">Batch Type *</Label>
              <Select
                value={formData.batchType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, batchType: value }))}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="startTime" className="form-label">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(event) => setFormData((prev) => ({ ...prev, startTime: event.target.value }))}
              />
              {errors.startTime && <p className="text-destructive text-sm mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <Label htmlFor="endTime" className="form-label">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(event) => setFormData((prev) => ({ ...prev, endTime: event.target.value }))}
              />
              {errors.endTime && <p className="text-destructive text-sm mt-1">{errors.endTime}</p>}
            </div>

            <div>
              <Label className="form-label">Course Type *</Label>
              <Select
                value={formData.courseType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, courseType: value }))}
              >
                <SelectTrigger>
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

          {formData.courseType === "OFFLINE" && (
            <div>
              <Label htmlFor="address" className="form-label">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Enter classroom or venue address"
              />
              {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Regional Pricing</h2>
                <p className="text-sm text-muted-foreground">Configure pricing for each supported market.</p>
              </div>
              {errors.pricing && <p className="text-sm text-destructive">{errors.pricing}</p>}
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Base Fee</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Final Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.countryPricing.map((pricing, index) => (
                    <TableRow key={pricing.country}>
                      <TableCell className="font-medium">{pricing.country}</TableCell>
                      <TableCell>{pricing.currency}</TableCell>
                      <TableCell>
                        <Input
                          value={pricing.fee}
                          onChange={(event) => handlePricingChange(index, "fee", event.target.value)}
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={pricing.discount}
                          onChange={(event) => handlePricingChange(index, "discount", event.target.value)}
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={pricing.price} readOnly className="bg-muted/40" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="form-label">Brochure</Label>
            <label className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors hover:border-primary/40">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setBrochureFile(event.target.files?.[0] || null)}
              />
              <div className="space-y-2">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {brochureFile ? brochureFile.name : "Upload brochure"}
                </p>
                <p className="text-xs text-muted-foreground">PDF, JPG, JPEG, or PNG up to 10MB</p>
              </div>
            </label>

            {existingBrochure && !brochureFile && (
              <a
                href={existingBrochure}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View existing brochure
              </a>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/courses")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || catalogLoading}>
              {loading ? "Saving..." : isEditMode ? "Update Schedule" : "Create Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
