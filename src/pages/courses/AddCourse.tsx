import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar as CalendarIcon, Clock3, Upload } from "lucide-react";
import { format } from "date-fns";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
const batchTypes = [
  { value: "WEEKEND", label: "Weekend" },
  { value: "WEEKDAY", label: "Weekdays" },
];
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

const normalizeDateValue = (value?: string | Date | null) => {
  if (!value) return "";

  if (typeof value === "string") {
    const matchedDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matchedDate?.[1]) {
      return matchedDate[1];
    }
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? "" : format(parsedDate, "yyyy-MM-dd");
};

const normalizeTimeValue = (value?: string | null) => {
  if (!value) return "";

  const [hours = "", minutes = ""] = String(value).split(":");
  if (!hours || !minutes) {
    return "";
  }

  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const parseDateFromValue = (value: string) => {
  if (!value) return undefined;

  const parsedDate = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const formatDateForDisplay = (value: string, placeholder: string) => {
  const parsedDate = parseDateFromValue(value);
  return parsedDate ? format(parsedDate, "dd MMM yyyy") : placeholder;
};

const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const baseMinuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const meridiemOptions = ["AM", "PM"] as const;

type Meridiem = (typeof meridiemOptions)[number];

const parseTimeParts = (value: string) => {
  if (!value) {
    return { hour: "09", minute: "00", meridiem: "AM" as Meridiem };
  }

  const normalizedValue = normalizeTimeValue(value);
  const [hoursPart = "09", minutesPart = "00"] = normalizedValue.split(":");
  const numericHours = Number(hoursPart);
  const meridiem: Meridiem = numericHours >= 12 ? "PM" : "AM";
  const hourValue = numericHours % 12 || 12;

  return {
    hour: String(hourValue).padStart(2, "0"),
    minute: minutesPart,
    meridiem,
  };
};

const buildTimeValue = (hour: string, minute: string, meridiem: Meridiem) => {
  const numericHour = Number(hour) % 12;
  const normalizedHour = meridiem === "PM" ? numericHour + 12 : numericHour;
  const finalHour = meridiem === "AM" && Number(hour) === 12 ? 0 : normalizedHour;

  return `${String(finalHour).padStart(2, "0")}:${minute}`;
};

const formatTimeForDisplay = (value: string, placeholder: string) => {
  if (!value) return placeholder;

  const { hour, minute, meridiem } = parseTimeParts(value);
  return `${hour}:${minute} ${meridiem}`;
};

const calendarClassNames = {
  months: "w-full",
  month: "w-full space-y-4",
  caption: "relative flex items-center justify-center pt-1",
  caption_label: "text-base font-semibold tracking-tight",
  table: "w-full border-collapse",
  head_row: "flex justify-between",
  head_cell: "w-10 rounded-md text-xs font-medium text-muted-foreground",
  row: "mt-2 flex w-full justify-between",
  cell: "h-10 w-10 p-0 text-center text-sm",
  day: "h-10 w-10 rounded-2xl p-0 font-medium aria-selected:opacity-100",
};

interface TimeOptionColumnProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const TimeOptionColumn = ({ label, options, selectedValue, onSelect }: TimeOptionColumnProps) => (
  <div className="space-y-2">
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    <div className="max-h-48 overflow-y-auto rounded-[1.25rem] bg-muted/30 p-2">
      <div className="space-y-1.5">
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-xl border text-sm font-semibold transition",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/60 bg-background/80 text-foreground hover:border-primary/30 hover:bg-accent/40",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

interface TimePickerFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
  onClearError: () => void;
  error?: string;
}

const TimePickerField = ({
  id,
  label,
  value,
  placeholder,
  onValueChange,
  onClearError,
  error,
}: TimePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const selectedParts = parseTimeParts(value);
  const minuteOptions = Array.from(new Set([selectedParts.minute, ...baseMinuteOptions])).sort(
    (left, right) => Number(left) - Number(right),
  );

  const updateTime = (updates: Partial<typeof selectedParts>) => {
    const nextParts = { ...selectedParts, ...updates };
    onClearError();
    onValueChange(buildTimeValue(nextParts.hour, nextParts.minute, nextParts.meridiem));
  };

  return (
    <div>
      <Label htmlFor={id} className="form-label">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-14 w-full justify-between rounded-[1.5rem] border-border/70 bg-background/90 px-4 text-left text-sm font-medium shadow-sm hover:bg-background/90",
              !value && "text-muted-foreground",
            )}
          >
            <span className="flex items-center gap-3 truncate">
              <Clock3 className="h-4 w-4 text-primary" />
              {formatTimeForDisplay(value, placeholder)}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[360px] rounded-[1.5rem] border border-border/70 bg-card/95 p-4 shadow-xl backdrop-blur"
        >
          <div className="space-y-4">
            <div className="rounded-[1.25rem] border border-border/60 bg-muted/35 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Selected Time</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {value ? formatTimeForDisplay(value, placeholder) : "Choose a time"}
              </p>
            </div>

            <div className="grid grid-cols-[1fr_1fr_92px] gap-3">
              <TimeOptionColumn
                label="Hour"
                options={hourOptions}
                selectedValue={selectedParts.hour}
                onSelect={(hour) => updateTime({ hour })}
              />
              <TimeOptionColumn
                label="Minute"
                options={minuteOptions}
                selectedValue={selectedParts.minute}
                onSelect={(minute) => updateTime({ minute })}
              />
              <TimeOptionColumn
                label="Type"
                options={[...meridiemOptions]}
                selectedValue={selectedParts.meridiem}
                onSelect={(meridiem) => updateTime({ meridiem: meridiem as Meridiem })}
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-4"
                onClick={() => {
                  onClearError();
                  onValueChange("");
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                className="rounded-full px-5"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

const fieldClassName =
  "rounded-[1.35rem] border-border/70 bg-background/90 px-4 shadow-sm transition focus-visible:ring-4 focus-visible:ring-primary/10";

const selectTriggerClassName =
  "h-12 rounded-[1.35rem] border-border/70 bg-background/90 px-4 shadow-sm data-[state=open]:border-primary/40 data-[state=open]:ring-4 data-[state=open]:ring-primary/10";

const selectContentClassName =
  "rounded-[1.25rem] border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur";

const selectItemClassName =
  "rounded-xl py-3 pl-9 pr-3 text-sm font-medium focus:bg-accent/80";

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
    maxParticipants: "",
    planAvailable: true,
    countryPricing: buildDefaultPricing(),
  });

  const selectedCourse = courseOptions.find((course) => String(course.id) === formData.courseId) || null;
  const selectedMentor = mentorOptions.find((mentor) => String(mentor.id) === formData.mentorId) || null;

  const serviceTypeOptions = useMemo(() => {
    const counts = courseOptions.reduce<Record<string, number>>((accumulator, course) => {
      if (!course.serviceType) {
        return accumulator;
      }

      accumulator[course.serviceType] = (accumulator[course.serviceType] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([serviceType, count]) => ({
        value: serviceType,
        label: `${serviceType} (${count})`,
      }));
  }, [courseOptions]);

  const filteredCourseOptions = useMemo(
    () => courseOptions.filter((course) => course.serviceType === formData.serviceType),
    [courseOptions, formData.serviceType],
  );

  const searchableCourseOptions = useMemo(
    () =>
      filteredCourseOptions.map((course) => ({
        value: String(course.id),
        label: course.name,
        keywords: [course.serviceType, course.name],
      })),
    [filteredCourseOptions],
  );

  const searchableMentorOptions = useMemo(
    () =>
      mentorOptions.map((mentor) => ({
        value: String(mentor.id),
        label: mentor.name,
        inlineMeta: mentor.specialization ? `(${mentor.specialization})` : undefined,
        keywords: [mentor.designation, mentor.specialization].filter(Boolean) as string[],
        badge: mentor.rating ? `${mentor.rating.toFixed(1)}★` : undefined,
      })),
    [mentorOptions],
  );

  const clearErrors = (...fieldNames: string[]) => {
    setErrors((previous) => {
      let changed = false;
      const nextErrors = { ...previous };

      fieldNames.forEach((fieldName) => {
        if (fieldName in nextErrors) {
          delete nextErrors[fieldName];
          changed = true;
        }
      });

      return changed ? nextErrors : previous;
    });
  };

  const handleServiceTypeChange = (value: string) => {
    const currentCourse = courseOptions.find((course) => String(course.id) === formData.courseId);
    const keepCurrentCourse = currentCourse?.serviceType === value;

    clearErrors("serviceType", "courseId", "mentorId");
    if (!keepCurrentCourse) {
      setMentorOptions([]);
    }

    setFormData((prev) => ({
      ...prev,
      serviceType: value,
      courseId: keepCurrentCourse ? prev.courseId : "",
      mentorId: keepCurrentCourse ? prev.mentorId : "",
    }));
  };

  const handleCourseChange = (value: string) => {
    const course = courseOptions.find((option) => String(option.id) === value);

    clearErrors("serviceType", "courseId", "mentorId");
    setFormData((prev) => ({
      ...prev,
      courseId: value,
      mentorId: "",
      serviceType: course?.serviceType || prev.serviceType,
    }));
  };

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
      setFormData((prev) => (prev.mentorId ? { ...prev, mentorId: "" } : prev));
      return;
    }

    loadMentors(formData.courseId);
  }, [formData.courseId]);

  useEffect(() => {
    if (!selectedCourse?.serviceType) {
      return;
    }

    setFormData((prev) => (
      prev.serviceType === selectedCourse.serviceType
        ? prev
        : { ...prev, serviceType: selectedCourse.serviceType }
    ));
  }, [selectedCourse?.serviceType]);

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
          startDate: normalizeDateValue(schedule.startDate),
          endDate: normalizeDateValue(schedule.endDate),
          duration: schedule.duration ? String(schedule.duration) : "",
          language: schedule.language || "English",
          startTime: normalizeTimeValue(schedule.startTime),
          endTime: normalizeTimeValue(schedule.endTime),
          batchType: schedule.batchType || "",
          courseType: schedule.courseType || "",
          address: schedule.address || "",
          maxParticipants: schedule.maxParticipants ? String(schedule.maxParticipants) : "",
          planAvailable: schedule.planAvailable ?? true,
          countryPricing: formattedPricing,
        });

        setExistingBrochure(schedule.brochure?.url || schedule.brochureUrl || null);
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

    if (!formData.serviceType) nextErrors.serviceType = "Service type is required";
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
    if (formData.maxParticipants) {
      const parsedMaxParticipants = Number(formData.maxParticipants);
      if (!Number.isInteger(parsedMaxParticipants) || parsedMaxParticipants <= 0) {
        nextErrors.maxParticipants = "Max participants must be a positive whole number";
      }
    }

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
      payload.append("maxParticipants", formData.maxParticipants);
      payload.append("planAvailable", String(formData.planAvailable));

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">{isEditMode ? "Edit Schedule" : "Add New Schedule"}</h1>
          <p className="page-subtitle">
            Pick a service type first, then choose a matching course and mapped mentor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="form-label">Service Type *</Label>
              <SearchableSelect
                value={formData.serviceType}
                onValueChange={handleServiceTypeChange}
                options={serviceTypeOptions}
                disabled={catalogLoading || serviceTypeOptions.length === 0}
                placeholder={catalogLoading ? "Loading service types..." : "Select service type"}
                searchPlaceholder="Search service type..."
                emptyMessage="No service types with mapped courses found."
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Only service types with available courses are shown here.
              </p>
              {errors.serviceType && <p className="text-destructive text-sm mt-1">{errors.serviceType}</p>}
            </div>

            <div>
              <Label className="form-label">Course Name *</Label>
              <SearchableSelect
                value={formData.courseId}
                onValueChange={handleCourseChange}
                options={searchableCourseOptions}
                disabled={!formData.serviceType || catalogLoading}
                placeholder={
                  catalogLoading
                    ? "Loading courses..."
                    : formData.serviceType
                      ? "Select course"
                      : "Select service type first"
                }
                searchPlaceholder="Search course..."
                emptyMessage={
                  formData.serviceType
                    ? "No courses found for this service type."
                    : "Select a service type first."
                }
              />
              {errors.courseId && <p className="text-destructive text-sm mt-1">{errors.courseId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="form-label">Mapped Mentor *</Label>
              <SearchableSelect
                value={formData.mentorId}
                onValueChange={(value) => {
                  clearErrors("mentorId");
                  setFormData((prev) => ({ ...prev, mentorId: value }));
                }}
                options={searchableMentorOptions}
                disabled={!formData.courseId || mentorLoading}
                placeholder={
                  mentorLoading
                    ? "Loading mentors..."
                    : formData.courseId
                      ? "Select mentor"
                      : "Select course first"
                }
                searchPlaceholder="Search mentor..."
                emptyMessage={
                  formData.courseId
                    ? "No mentors mapped to this course."
                    : "Select a course first."
                }
              />
              {errors.mentorId && <p className="text-destructive text-sm mt-1">{errors.mentorId}</p>}
              {formData.courseId && !mentorLoading && !errors.mentorId && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {mentorOptions.length > 0
                    ? `${mentorOptions.length} mapped ${mentorOptions.length === 1 ? "mentor" : "mentors"} available.`
                    : "No mentors are mapped to this course yet."}
                </p>
              )}
            </div>

            <div>
              <Label className="form-label">Difficulty *</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => {
                  clearErrors("difficultyLevel");
                  setFormData((prev) => ({ ...prev, difficultyLevel: value }));
                }}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level} className={selectItemClassName}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficultyLevel && <p className="text-destructive text-sm mt-1">{errors.difficultyLevel}</p>}
            </div>
          </div>

          {selectedMentor && (
            <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4 shadow-sm">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-3 xl:items-end">
            <div className="col-span-1">
              <Label className="form-label">Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language} className={selectItemClassName}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1">
              <Label htmlFor="duration" className="form-label">Duration *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(event) => {
                  clearErrors("duration");
                  setFormData((prev) => ({ ...prev, duration: event.target.value }));
                }}
                placeholder="Days"
                className={`h-12 ${fieldClassName}`}
              />
              {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
            </div>

            <div className="col-span-1">
              <Label htmlFor="maxParticipants" className="form-label">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                step="1"
                value={formData.maxParticipants}
                onChange={(event) => {
                  clearErrors("maxParticipants");
                  setFormData((prev) => ({ ...prev, maxParticipants: event.target.value }));
                }}
                placeholder="Seats"
                className={`h-12 ${fieldClassName}`}
              />
              {errors.maxParticipants && <p className="text-destructive text-sm mt-1">{errors.maxParticipants}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 xl:items-end">
            <div className="flex min-h-[56px] items-center justify-between rounded-[1.5rem] border border-border/70 bg-muted/30 px-5 py-3 shadow-sm">
              <div>
                <p className="text-sm font-medium">Premium Plan Available</p>
                <p className="text-xs text-muted-foreground">Enable premium plan for this schedule</p>
              </div>
              <Switch
                checked={formData.planAvailable}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, planAvailable: checked }))}
              />
            </div>

            <div className="flex min-h-[56px] items-center justify-between rounded-[1.5rem] border border-border/70 bg-muted/30 px-5 py-3 shadow-sm">
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

          <div>
            <Label htmlFor="description" className="form-label">Schedule Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) => {
                clearErrors("description");
                setFormData((prev) => ({ ...prev, description: event.target.value }));
              }}
              placeholder="Describe the batch, audience, or delivery context"
              className={`h-24 ${fieldClassName}`}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="form-label">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-14 w-full justify-between rounded-[1.5rem] border-border/70 bg-background/90 px-4 text-left text-sm font-medium shadow-sm hover:bg-background/90",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {formatDateForDisplay(formData.startDate, "Select start date")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[340px] rounded-[1.5rem] border border-border/70 bg-card/95 p-0 shadow-xl backdrop-blur"
                >
                  <Calendar
                    mode="single"
                    selected={parseDateFromValue(formData.startDate)}
                    onSelect={(date) => {
                      clearErrors("startDate", "endDate");
                      setFormData((prev) => ({
                        ...prev,
                        startDate: date ? format(date, "yyyy-MM-dd") : "",
                        endDate: prev.endDate && date && prev.endDate < format(date, "yyyy-MM-dd") ? "" : prev.endDate,
                      }));
                    }}
                    className="w-full p-4"
                    classNames={calendarClassNames}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <Label className="form-label">End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-14 w-full justify-between rounded-[1.5rem] border-border/70 bg-background/90 px-4 text-left text-sm font-medium shadow-sm hover:bg-background/90",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {formatDateForDisplay(formData.endDate, "Select end date")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[340px] rounded-[1.5rem] border border-border/70 bg-card/95 p-0 shadow-xl backdrop-blur"
                >
                  <Calendar
                    mode="single"
                    selected={parseDateFromValue(formData.endDate)}
                    onSelect={(date) => {
                      clearErrors("endDate");
                      setFormData((prev) => ({
                        ...prev,
                        endDate: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                    }}
                    disabled={(date) => {
                      const startDate = parseDateFromValue(formData.startDate);
                      return startDate ? date < startDate : false;
                    }}
                    className="w-full p-4"
                    classNames={calendarClassNames}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <Label className="form-label">Batch Type *</Label>
              <Select
                value={formData.batchType}
                onValueChange={(value) => {
                  clearErrors("batchType");
                  setFormData((prev) => ({ ...prev, batchType: value }));
                }}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Select batch type" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {batchTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className={selectItemClassName}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.batchType && <p className="text-destructive text-sm mt-1">{errors.batchType}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TimePickerField
              id="startTime"
              label="Start Time *"
              value={formData.startTime}
              placeholder="Select start time"
              onClearError={() => clearErrors("startTime")}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, startTime: value }))}
              error={errors.startTime}
            />

            <TimePickerField
              id="endTime"
              label="End Time *"
              value={formData.endTime}
              placeholder="Select end time"
              onClearError={() => clearErrors("endTime")}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, endTime: value }))}
              error={errors.endTime}
            />

            <div>
              <Label className="form-label">Course Type *</Label>
              <Select
                value={formData.courseType}
                onValueChange={(value) => {
                  clearErrors("courseType", "address");
                  setFormData((prev) => ({ ...prev, courseType: value }));
                }}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {courseTypes.map((type) => (
                    <SelectItem key={type} value={type} className={selectItemClassName}>
                      {type}
                    </SelectItem>
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
                onChange={(event) => {
                  clearErrors("address");
                  setFormData((prev) => ({ ...prev, address: event.target.value }));
                }}
                placeholder="Enter classroom or venue address"
                className={fieldClassName}
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
                          className={fieldClassName}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={pricing.discount}
                          onChange={(event) => handlePricingChange(index, "discount", event.target.value)}
                          placeholder="0"
                          className={fieldClassName}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={pricing.price} readOnly className={`${fieldClassName} bg-muted/40`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="form-label">Brochure (Optional)</Label>
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
