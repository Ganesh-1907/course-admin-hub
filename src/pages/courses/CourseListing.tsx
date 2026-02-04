import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getAllCourses, deleteCourse } from "@/services/api";

const serviceTypes = ["All Types", "Agile", "Service", "SAFe", "Project", "Quality", "Business", "Generative AI"];

const CourseListing = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    serviceType: "All Types",
  });
  const itemsPerPage = 10;

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getAllCourses(currentPage, itemsPerPage, {
          search: filters.search || undefined,
          serviceType: filters.serviceType !== "All Types" ? filters.serviceType : undefined,
        });

        if (response.success) {
          setCourses(response.data.courses || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, filters]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await deleteCourse(deleteId);
      if (response.success) {
        toast.success("Course deleted successfully!");
        setCourses(courses.filter(c => c._id !== deleteId));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete course");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilters({ ...filters, serviceType: value });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Course Listing</h1>
            <p className="page-subtitle">Manage all your courses</p>
          </div>
          <Button onClick={() => navigate("/courses/add")}>Add New Course</Button>
        </div>

        {/* Filters */}
        <div className="admin-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search course name..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.serviceType}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Course Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading courses...</div>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">No courses found</div>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-header-cell font-bold text-black">Course ID</th>
                  <th className="table-header-cell font-bold text-black">Course Name</th>
                  <th className="table-header-cell font-bold text-black">Type</th>
                  <th className="table-header-cell font-bold text-black">Fee</th>
                  <th className="table-header-cell font-bold text-black">Duration</th>
                  <th className="table-header-cell font-bold text-black">Status</th>
                  <th className="table-header-cell text-right font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const courseId = course._id || course.id || course.courseId;
                  return (
                  <tr key={courseId} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link
                        to={`/courses/${courseId}`}
                        className="text-primary hover:underline"
                      >
                        {course.courseId || courseId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{course.courseName}</td>
                    <td className="px-4 py-3">
                      <span className="text-foreground">{course.serviceType}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">${course.finalPrice || course.price}</td>
                    <td className="px-4 py-3 text-foreground">{course.duration} days</td>
                    <td className="px-4 py-3">
                      <span className={course.isActive ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => navigate(`/courses/${courseId}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => setDeleteId(courseId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && courses.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CourseListing;
