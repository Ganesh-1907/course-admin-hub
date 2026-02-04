import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createCourse, getCourseById, updateCourse } from "@/services/api";

const serviceTypes = ["Agile", "Service", "SAFe", "Project", "Quality", "Business", "Generative AI"];
const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

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
    fee: "",
    discount: "",
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
            fee: course.price ? String(course.price) : "",
            discount: course.discountPercentage ? String(course.discountPercentage) : "",
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

  const finalPrice = formData.fee && formData.discount
    ? (parseFloat(formData.fee) - (parseFloat(formData.fee) * parseFloat(formData.discount) / 100)).toFixed(2)
    : formData.fee || "0.00";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Course name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.mentor) newErrors.mentor = "Mentor name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.fee) newErrors.fee = "Fee is required";
    if (!formData.serviceType) newErrors.serviceType = "Service type is required";
    if (!formData.difficultyLevel) newErrors.difficultyLevel = "Difficulty level is required";
    
    // Validate date range
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
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
        price: parseFloat(formData.fee),
        discountPercentage: formData.discount ? parseFloat(formData.discount) : 0,
      };

      const response = isEditMode && id
        ? await updateCourse(id, payload)
        : await createCourse(payload);

      if (response.success) {
        toast.success(isEditMode ? "Course updated successfully!" : "Course created successfully!");
        navigate("/courses");
      } else {
        toast.error(response.message || "Failed to create course");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">{isEditMode ? "Edit Course" : "Add New Course"}</h1>
          <p className="page-subtitle">
            {isEditMode ? "Update course details" : "Create a new course for your students"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="form-label">Course Name *</Label>
              <Input
                id="title"
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
                value={formData.mentor}
                onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                placeholder="Enter mentor name"
              />
              {errors.mentor && <p className="text-destructive text-sm mt-1">{errors.mentor}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="form-label">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter course description"
              rows={4}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="serviceType" className="form-label">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
              >
                <SelectTrigger>
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
                <SelectTrigger>
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
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="isActive" className="form-label">Active Course</Label>
              <p className="text-sm text-muted-foreground">Toggle to activate or deactivate this course</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(value) => setFormData({ ...formData, isActive: value })}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="form-label">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="pl-10"
                />
              </div>
              {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <Label htmlFor="endDate" className="form-label">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="pl-10"
                />
              </div>
              {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Duration and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="duration" className="form-label">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
              />
              {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
            </div>

            <div>
              <Label htmlFor="fee" className="form-label">Fee ($) *</Label>
              <Input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="0.00"
              />
              {errors.fee && <p className="text-destructive text-sm mt-1">{errors.fee}</p>}
            </div>

            <div>
              <Label htmlFor="discount" className="form-label">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label className="form-label">Final Price</Label>
            <Input
              value={`$${finalPrice}`}
              readOnly
              className="bg-secondary font-semibold"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
