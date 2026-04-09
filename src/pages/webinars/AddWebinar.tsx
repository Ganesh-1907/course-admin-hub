import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { COUNTRY_OPTIONS } from "@/constants/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createWebinar, getAllMentors } from "@/services/api";
import type { Mentor } from "@/types/mentor";
import type { WebinarPayload } from "@/types/webinar";
import { toast } from "sonner";

const NO_SECOND_MENTOR_VALUE = "NONE";

type WebinarFormData = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  primaryMentorId: string;
  secondaryMentorId: string;
  webinarDate: string;
  posterUrl: string;
  location: string;
};

const createInitialFormData = (): WebinarFormData => ({
  name: "",
  description: "",
  startTime: "",
  endTime: "",
  primaryMentorId: "",
  secondaryMentorId: "",
  webinarDate: "",
  posterUrl: "",
  location: "",
});

const AddWebinar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WebinarFormData>(createInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoadingMentors(true);

      try {
        const response = await getAllMentors(1, 500, {
          isActive: true,
          sortBy: "name",
          order: "ASC",
        });

        if (response.success) {
          setMentors(response.data?.mentors || []);
          return;
        }

        toast.error(response.message || "Failed to load mentors");
        setMentors([]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load mentors");
        setMentors([]);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchMentors();
  }, []);

  const clearFieldError = (field: keyof WebinarFormData) => {
    setErrors((previousErrors) => {
      if (!previousErrors[field]) return previousErrors;

      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleTextChange = (field: keyof WebinarFormData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((previousFormData) => ({
      ...previousFormData,
      [field]: event.target.value,
    }));
    clearFieldError(field);
  };

  const handleSelectChange = (field: keyof WebinarFormData, value: string) => {
    setFormData((previousFormData) => ({
      ...previousFormData,
      [field]: value === NO_SECOND_MENTOR_VALUE ? "" : value,
    }));
    clearFieldError(field);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = "Webinar name is required";
    if (!formData.description.trim()) nextErrors.description = "Description is required";
    if (!formData.webinarDate) nextErrors.webinarDate = "Webinar date is required";
    if (!formData.startTime) nextErrors.startTime = "Start time is required";
    if (!formData.endTime) nextErrors.endTime = "End time is required";
    if (!formData.primaryMentorId) nextErrors.primaryMentorId = "Primary mentor is required";
    if (!formData.posterUrl.trim()) nextErrors.posterUrl = "Poster URL is required";
    if (!formData.location) nextErrors.location = "Location is required";

    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      nextErrors.endTime = "End time must be after start time";
    }

    if (formData.secondaryMentorId && formData.secondaryMentorId === formData.primaryMentorId) {
      nextErrors.secondaryMentorId = "Second mentor must be different from primary mentor";
    }

    return nextErrors;
  };

  const handleReset = () => {
    setFormData(createInitialFormData());
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted webinar fields");
      return;
    }

    setSubmitting(true);

    try {
      const webinarPayload: WebinarPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        webinarDate: formData.webinarDate,
        posterUrl: formData.posterUrl.trim(),
        location: formData.location,
        primaryMentorId: Number(formData.primaryMentorId),
        secondaryMentorId: formData.secondaryMentorId ? Number(formData.secondaryMentorId) : undefined,
      };

      const response = await createWebinar(webinarPayload);
      toast.success(response.message || "Webinar added successfully");
      navigate("/webinars");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create webinar");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = (field: keyof WebinarFormData) =>
    cn(
      "h-11 rounded-xl border-border/70 bg-background/90 shadow-sm",
      errors[field] && "border-destructive focus-visible:ring-destructive",
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-title">Add Webinar</h1>
            <p className="page-subtitle">Create a webinar with mentor, timing, poster, and supported location details.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => navigate("/webinars")}>
              <ArrowLeft className="h-4 w-4" />
              Webinar Listing
            </Button>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
              Country options match the course page locations
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-8">
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Webinar Details</h2>
              <p className="text-sm text-muted-foreground">Add the core webinar info that will appear in the webinar list.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="form-label">Webinar Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleTextChange("name")}
                  placeholder="Enter webinar name"
                  className={inputClassName("name")}
                />
                {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="form-label">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleTextChange("description")}
                  placeholder="Write the webinar summary, highlights, and what attendees can expect..."
                  className={cn(
                    "min-h-[160px] rounded-2xl border-border/70 bg-background/90 shadow-sm",
                    errors.description && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {errors.description && <p className="mt-1.5 text-sm text-destructive">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="webinarDate" className="form-label">Webinar Date *</Label>
                <Input
                  id="webinarDate"
                  type="date"
                  value={formData.webinarDate}
                  onChange={handleTextChange("webinarDate")}
                  className={inputClassName("webinarDate")}
                />
                {errors.webinarDate && <p className="mt-1.5 text-sm text-destructive">{errors.webinarDate}</p>}
              </div>

              <div>
                <Label htmlFor="location" className="form-label">Webinar Location *</Label>
                <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                  <SelectTrigger className={inputClassName("location")}>
                    <SelectValue placeholder="Select webinar location" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                    {COUNTRY_OPTIONS.map((country, index) => (
                      <SelectItem key={country} value={country} className={`text-left ${index % 2 === 0 ? "bg-muted/30" : "bg-card"}`}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && <p className="mt-1.5 text-sm text-destructive">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="startTime" className="form-label">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleTextChange("startTime")}
                  className={inputClassName("startTime")}
                />
                {errors.startTime && <p className="mt-1.5 text-sm text-destructive">{errors.startTime}</p>}
              </div>

              <div>
                <Label htmlFor="endTime" className="form-label">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleTextChange("endTime")}
                  className={inputClassName("endTime")}
                />
                {errors.endTime && <p className="mt-1.5 text-sm text-destructive">{errors.endTime}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="posterUrl" className="form-label">Webinar Poster URL *</Label>
                <Input
                  id="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleTextChange("posterUrl")}
                  placeholder="https://example.com/webinar-poster.jpg"
                  className={inputClassName("posterUrl")}
                />
                {errors.posterUrl && <p className="mt-1.5 text-sm text-destructive">{errors.posterUrl}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Mentor Assignment</h2>
              <p className="text-sm text-muted-foreground">Choose the main mentor and optionally add a second mentor for the webinar.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label className="form-label">Mentor Name *</Label>
                <Select
                  value={formData.primaryMentorId}
                  onValueChange={(value) => handleSelectChange("primaryMentorId", value)}
                  disabled={loadingMentors || mentors.length === 0}
                >
                  <SelectTrigger className={inputClassName("primaryMentorId")}>
                    <SelectValue placeholder={loadingMentors ? "Loading mentors..." : "Select mentor"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                    {mentors.map((mentor, index) => (
                      <SelectItem key={mentor.id} value={String(mentor.id)} className={`text-left ${index % 2 === 0 ? "bg-muted/30" : "bg-card"}`}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primaryMentorId && <p className="mt-1.5 text-sm text-destructive">{errors.primaryMentorId}</p>}
              </div>

              <div>
                <Label className="form-label">Second Mentor</Label>
                <Select
                  value={formData.secondaryMentorId || NO_SECOND_MENTOR_VALUE}
                  onValueChange={(value) => handleSelectChange("secondaryMentorId", value)}
                  disabled={loadingMentors || mentors.length === 0}
                >
                  <SelectTrigger className={inputClassName("secondaryMentorId")}>
                    <SelectValue placeholder={loadingMentors ? "Loading mentors..." : "Select optional mentor"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                    <SelectItem value={NO_SECOND_MENTOR_VALUE} className="text-left bg-muted/30">
                      No second mentor
                    </SelectItem>
                    {mentors.map((mentor, index) => (
                      <SelectItem key={mentor.id} value={String(mentor.id)} className={`text-left ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.secondaryMentorId ? (
                  <p className="mt-1.5 text-sm text-destructive">{errors.secondaryMentorId}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">Optional. Leave this empty if one mentor is enough.</p>
                )}
              </div>
            </div>

            {!loadingMentors && mentors.length === 0 && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                No active mentors found. Please add mentors before creating a webinar.
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleReset} disabled={submitting}>
              <RotateCcw className="h-4 w-4" />
              Reset Form
            </Button>
            <Button type="submit" disabled={submitting || loadingMentors || mentors.length === 0}>
              <Save className="h-4 w-4" />
              {submitting ? "Saving Webinar..." : "Save Webinar"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddWebinar;
