import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, FileText, Calendar } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const serviceTypes = ["Agile", "Service", "SAFe", "Project", "Quality", "Business", "Generative AI"];

const AddCourse = () => {
  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mentor: "",
    startDate: "",
    endDate: "",
    price: "",
    discount: "",
    serviceType: "",
  });
  
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const finalPrice = formData.price && formData.discount
    ? (parseFloat(formData.price) - (parseFloat(formData.price) * parseFloat(formData.discount) / 100)).toFixed(2)
    : formData.price || "0.00";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setBrochure(file);
    } else {
      toast.error("Please upload a PDF file only");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Course name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.mentor) newErrors.mentor = "Mentor name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.serviceType) newErrors.serviceType = "Service type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      toast.success("Course saved successfully!");
      navigate("/courses");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">Add New Course</h1>
          <p className="page-subtitle">Create a new course for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="form-label">Course Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Course preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCourseImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-secondary/30 transition-all"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload course image</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="form-label">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter course name"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
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

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="price" className="form-label">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
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

            <div>
              <Label className="form-label">Final Price ($)</Label>
              <Input
                value={`$${finalPrice}`}
                readOnly
                className="bg-secondary font-semibold"
              />
            </div>
          </div>

          {/* Service Type */}
          <div>
            <Label className="form-label">Service Type *</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
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

          {/* Brochure Upload */}
          <div>
            <Label className="form-label">Brochure (PDF only)</Label>
            <div className="mt-2">
              {brochure ? (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm flex-1 truncate">{brochure.name}</span>
                  <button
                    type="button"
                    onClick={() => setBrochure(null)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => brochureInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 hover:border-primary hover:bg-secondary/30 transition-all"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload brochure PDF</span>
                </button>
              )}
              <input
                ref={brochureInputRef}
                type="file"
                accept=".pdf"
                onChange={handleBrochureChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/courses")}>
              Cancel
            </Button>
            <Button type="submit">Save Course</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
