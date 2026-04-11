import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Image, Link2, RotateCcw, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createMentor, getMentorById, updateMentor } from "@/services/api";
import type { Mentor, MentorPayload } from "@/types/mentor";
import { toast } from "sonner";

type MentorFormData = {
  name: string;
  specialization: string;
  designation: string;
  description: string;
  rating: string;
  yearsOfExperience: string;
  linkedinId: string;
  photoUrl: string;
  isActive: boolean;
};

const createInitialFormData = (): MentorFormData => ({
  name: "",
  specialization: "",
  designation: "",
  description: "",
  rating: "",
  yearsOfExperience: "",
  linkedinId: "",
  photoUrl: "",
  isActive: true,
});

const mapMentorToFormData = (mentor: Mentor): MentorFormData => ({
  name: mentor.name || "",
  specialization: mentor.specialization || "",
  designation: mentor.designation || "",
  description: mentor.description || "",
  rating: mentor.rating !== null && mentor.rating !== undefined ? String(mentor.rating) : "",
  yearsOfExperience: mentor.yearsOfExperience !== null && mentor.yearsOfExperience !== undefined
    ? String(mentor.yearsOfExperience)
    : "",
  linkedinId: mentor.linkedinId || "",
  photoUrl: mentor.photoUrl || "",
  isActive: mentor.isActive ?? true,
});

const AddMentor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState<MentorFormData>(createInitialFormData);
  const [initialFormData, setInitialFormData] = useState<MentorFormData>(createInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingMentor, setLoadingMentor] = useState(isEditMode);
  const [mentorLoadError, setMentorLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isEditMode || !id) {
      const emptyForm = createInitialFormData();
      setFormData(emptyForm);
      setInitialFormData(emptyForm);
      setErrors({});
      setLoadingMentor(false);
      setMentorLoadError(null);
      return () => {
        isMounted = false;
      };
    }

    const fetchMentor = async () => {
      setLoadingMentor(true);
      setMentorLoadError(null);

      try {
        const response = await getMentorById(id);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load mentor");
        }

        if (!isMounted) return;

        const mappedMentor = mapMentorToFormData(response.data as Mentor);
        setFormData(mappedMentor);
        setInitialFormData(mappedMentor);
        setErrors({});
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : "Failed to load mentor";
        setMentorLoadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (isMounted) {
          setLoadingMentor(false);
        }
      }
    };

    fetchMentor();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const clearFieldError = (field: keyof MentorFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleTextChange = (field: keyof Omit<MentorFormData, "isActive">) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    clearFieldError(field);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.specialization.trim()) nextErrors.specialization = "Specialization is required";
    if (!formData.designation.trim()) nextErrors.designation = "Designation is required";

    if (!formData.yearsOfExperience.trim()) {
      nextErrors.yearsOfExperience = "Years of experience is required";
    } else {
      const yearsValue = Number(formData.yearsOfExperience);
      if (!Number.isInteger(yearsValue) || yearsValue < 0) {
        nextErrors.yearsOfExperience = "Enter a valid whole number";
      }
    }

    if (formData.rating.trim()) {
      const ratingValue = Number(formData.rating);
      if (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        nextErrors.rating = "Rating must be between 0 and 5";
      }
    }

    return nextErrors;
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted mentor fields");
      return;
    }

    setSubmitting(true);

    try {
      const mentorPayload: MentorPayload = {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        designation: formData.designation.trim(),
        description: formData.description.trim() || undefined,
        rating: formData.rating.trim() ? Number(formData.rating) : undefined,
        yearsOfExperience: Number(formData.yearsOfExperience),
        linkedinId: formData.linkedinId.trim() || undefined,
        photoUrl: formData.photoUrl.trim() || undefined,
        isActive: formData.isActive,
      };

      const response = isEditMode && id
        ? await updateMentor(id, mentorPayload)
        : await createMentor(mentorPayload);

      toast.success(response.message || (isEditMode ? "Mentor updated successfully" : "Mentor added successfully"));
      navigate("/mentors");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} mentor`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = (field: keyof MentorFormData) =>
    cn(
      "h-11 rounded-xl border-border/70 bg-background/90 shadow-sm",
      errors[field] && "border-destructive focus-visible:ring-destructive",
    );

  if (loadingMentor) {
    return (
      <AdminLayout>
        <div className="admin-card p-6 text-center text-muted-foreground">
          Loading mentor details...
        </div>
      </AdminLayout>
    );
  }

  if (mentorLoadError) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => navigate("/mentors")} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Mentors
          </Button>
          <div className="admin-card p-6 text-center">
            <p className="text-destructive">{mentorLoadError}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-title">{isEditMode ? "Edit Mentor" : "Add Mentor"}</h1>
            <p className="page-subtitle">
              {isEditMode
                ? "Update the mentor record and save the latest details."
                : "Create a mentor record and save it directly into the mentors table."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => navigate("/mentors")}>
              <ArrowLeft className="h-4 w-4" />
              Mentor Listing
            </Button>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
              Required fields: name, specialization, designation, years of experience
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="admin-card p-6 space-y-8">
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Basic Details</h2>
                <p className="text-sm text-muted-foreground">Fill the core mentor information used across the platform.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="form-label">Mentor Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleTextChange("name")}
                    placeholder="Enter mentor full name"
                    className={inputClassName("name")}
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="specialization" className="form-label">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={handleTextChange("specialization")}
                    placeholder="Agile Coaching, Scrum, DevOps..."
                    className={inputClassName("specialization")}
                  />
                  {errors.specialization && <p className="mt-1.5 text-sm text-destructive">{errors.specialization}</p>}
                </div>

                <div>
                  <Label htmlFor="designation" className="form-label">Designation *</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={handleTextChange("designation")}
                    placeholder="Senior Mentor, Agile Coach..."
                    className={inputClassName("designation")}
                  />
                  {errors.designation && <p className="mt-1.5 text-sm text-destructive">{errors.designation}</p>}
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience" className="form-label">Years of Experience *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.yearsOfExperience}
                    onChange={handleTextChange("yearsOfExperience")}
                    placeholder="8"
                    className={inputClassName("yearsOfExperience")}
                  />
                  {errors.yearsOfExperience && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.yearsOfExperience}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rating" className="form-label">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleTextChange("rating")}
                    placeholder="4.8"
                    className={inputClassName("rating")}
                  />
                  {errors.rating ? (
                    <p className="mt-1.5 text-sm text-destructive">{errors.rating}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">Optional. Leave empty if you want the backend default.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label htmlFor="isActive" className="form-label mb-0">Active Status</Label>
                      <p className="mt-1 text-sm text-muted-foreground">Enable this mentor for use in active experiences.</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({ ...prev, isActive: checked }));
                        clearFieldError("isActive");
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profile Links</h2>
                <p className="text-sm text-muted-foreground">Optional external profile and image details for the mentor card.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="linkedinId" className="form-label">LinkedIn ID</Label>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="linkedinId"
                      value={formData.linkedinId}
                      onChange={handleTextChange("linkedinId")}
                      placeholder="mentor-linkedin-id"
                      className={cn(inputClassName("linkedinId"), "pl-10")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="photoUrl" className="form-label">Photo URL</Label>
                  <div className="relative">
                    <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="photoUrl"
                      value={formData.photoUrl}
                      onChange={handleTextChange("photoUrl")}
                      placeholder="https://example.com/mentor-photo.jpg"
                      className={cn(inputClassName("photoUrl"), "pl-10")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="text-sm text-muted-foreground">Add a short bio or background summary for this mentor.</p>
              </div>

              <div>
                <Label htmlFor="description" className="form-label">Mentor Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleTextChange("description")}
                  placeholder="Write a short mentor profile, strengths, domain focus, and teaching experience..."
                  className={cn(
                    "min-h-[160px] rounded-2xl border-border/70 bg-background/90 shadow-sm",
                    errors.description && "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>
                <RotateCcw className="h-4 w-4" />
                {isEditMode ? "Reset Changes" : "Reset Form"}
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4" />
                {submitting
                  ? isEditMode
                    ? "Updating Mentor..."
                    : "Saving Mentor..."
                  : isEditMode
                    ? "Update Mentor"
                    : "Save Mentor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddMentor;
