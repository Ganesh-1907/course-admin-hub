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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/courses")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        <div className="admin-card overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{course.serviceType}</Badge>
                  <Badge variant={course.isActive ? "default" : "destructive"}>
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{course.courseName}</h1>
              </div>
              <Button onClick={() => navigate(`/courses/${id}/edit`)} className="gap-2">
                Edit Course
              </Button>
            </div>

            {/* Description */}
            {course.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.duration && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-semibold text-foreground">{course.duration} days</p>
                </div>
              )}

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Service Type</span>
                </div>
                <p className="font-semibold text-foreground">{course.serviceType}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <p className="font-semibold text-foreground">{course.enrollmentCount || 0} students</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Pricing Details</h3>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Original Fee</span>
                  <p className={course.discountPercentage && course.discountPercentage > 0 ? "text-lg line-through text-muted-foreground" : "text-2xl font-semibold text-foreground"}>
                    ${course.price}
                  </p>
                </div>
                {course.discountPercentage && course.discountPercentage > 0 && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Discount</span>
                      <p className="text-lg text-success font-medium">-{course.discountPercentage}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Final Price</span>
                      <p className="text-3xl font-bold text-primary">${finalPrice}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/30 rounded-lg p-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-semibold text-foreground">
                  {course.startDate ? new Date(course.startDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="font-semibold text-foreground">
                  {course.endDate ? new Date(course.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Mentor</p>
                <p className="font-semibold text-foreground">{course.mentor || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course ID</p>
                <p className="font-semibold text-foreground">{course.courseId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold text-foreground">
                  {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold text-foreground">
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;
