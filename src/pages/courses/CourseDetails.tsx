import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Tag, DollarSign, Loader } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCourseById } from "@/services/api";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError("Course ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching course with ID:", id);
        
        const response = await getCourseById(id);
        console.log("API Response:", response);
        
        if (response.success && response.data) {
          console.log("Course data received:", response.data);
          setCourse(response.data);
        } else {
          setError(response.message || "Failed to load course");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load course";
        console.error("Error fetching course:", errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !course) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/courses")} className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <div className="admin-card p-6 text-center">
            <p className="text-destructive mb-4">{error || "Course not found"}</p>
            <Button onClick={() => navigate("/courses")}>Go to Courses</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const finalPrice = course.discountPercentage && course.discountPercentage > 0
    ? (course.price - (course.price * course.discountPercentage / 100)).toFixed(2)
    : course.price?.toFixed(2);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/courses")} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
            </Button>
            <Button onClick={() => navigate(`/courses/edit/${id}`)} className="gap-2">
                Edit Course
            </Button>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Header Section */}
            <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant={course.isActive ? "default" : "destructive"} className="px-3 py-1 text-sm">
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5">
                    {course.courseType}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {course.batchType} Batch
                  </Badge>
                  <span className="text-muted-foreground text-sm ml-auto font-mono">{course.courseId}</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{course.courseName}</h1>
                <p className="text-muted-foreground text-lg">{course.description}</p>
            </div>

            <div className="h-px bg-border" />

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Mentor</p>
                    <p className="font-semibold text-foreground text-lg">{course.mentor}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p className="font-semibold text-foreground text-lg">{course.language}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                    <p className="font-semibold text-foreground text-lg">{course.serviceType}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                    <p className="font-semibold text-foreground text-lg">{course.difficultyLevel}</p>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Schedule & Timing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium text-foreground">{course.duration} Days</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Date Range</p>
                        <p className="font-medium text-foreground">
                            {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Daily Timing</p>
                        <p className="font-medium text-foreground">
                            {course.startTime} - {course.endTime}
                        </p>
                    </div>
                </div>
            </div>

            {/* Address Section (Only for Offline) */}
            {course.courseType === 'Offline' && course.address && (
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                     <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Location
                    </h3>
                    <p className="text-foreground">{course.address}</p>
                </div>
            )}

            {/* Pricing Table */}
            <div>
                 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Global Pricing
                </h3>
                <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="h-10 px-4 text-left font-medium">Region</th>
                                <th className="h-10 px-4 text-left font-medium">Currency</th>
                                <th className="h-10 px-4 text-right font-medium">Base Fee</th>
                                <th className="h-10 px-4 text-right font-medium">Discount</th>
                                <th className="h-10 px-4 text-right font-medium">Final Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {course.countryPricing && course.countryPricing.map((price: any, index: number) => (
                                <tr key={index} className="bg-card hover:bg-muted/20 transition-colors">
                                    <td className="p-4 font-medium">{price.country}</td>
                                    <td className="p-4 text-muted-foreground">{price.currency}</td>
                                    <td className="p-4 text-right">{price.price.toFixed(2)}</td>
                                    <td className="p-4 text-right text-green-600">{price.discountPercentage}%</td>
                                    <td className="p-4 text-right font-bold text-primary">
                                        {/* Helper function or logic to show symbol could go here, for now just code */}
                                        {price.finalPrice.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-6 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
                <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                <p>Last Updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
                <p>Total Enrollments: {course.enrollmentCount}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;
