import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Trash2, Edit, MoreHorizontal, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/ui/page-loader";
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
import { getAllCourses, deleteCourse, getServiceTypes } from "@/services/api";

const CourseListing = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [serviceTypesList, setServiceTypesList] = useState<string[]>(["All Types"]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    serviceType: "All Types",
    batchType: "All",
    courseType: "All",
  });
  const itemsPerPage = 10;

  // Fetch service types
  useEffect(() => {
    const fetchServiceTypes = async () => {
        try {
            const response = await getServiceTypes();
            if (response.success && response.data) {
                const names = response.data.map((st: any) => st.name);
                // Ensure unique values and "All Types" is first
                const uniqueNames = Array.from(new Set(names)) as string[];
                setServiceTypesList(["All Types", ...uniqueNames]);
            }
        } catch (error) {
            console.error("Failed to fetch service types:", error);
            // Fallback list if fetching fails
            setServiceTypesList(["All Types", "Agile", "Service", "SAFe", "Project", "Quality", "Business", "Generative AI"]);
        }
    };
    fetchServiceTypes();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getAllCourses(currentPage, itemsPerPage, {
          search: filters.search || undefined,
          serviceType: filters.serviceType !== "All Types" ? filters.serviceType : undefined,
          batchType: filters.batchType !== "All" ? filters.batchType : undefined,
          courseType: filters.courseType !== "All" ? filters.courseType : undefined,
          sortBy: "courseId",
          order: "ASC",
        });

        if (response.success) {
          setCourses(response.data.courses || []);
          setTotalPages(response.data.pagination?.pages || 1);
        }
      } catch (error) {
        toast.error("Failed to load courses. Please check your connection.");
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
        // Re-fetch to get accurate pagination and updated list
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const fetchCourses = async () => {
          setLoading(true);
          try {
            const response = await getAllCourses(currentPage, itemsPerPage, {
              search: filters.search || undefined,
              serviceType: filters.serviceType !== "All Types" ? filters.serviceType : undefined,
              batchType: filters.batchType !== "All" ? filters.batchType : undefined,
              courseType: filters.courseType !== "All" ? filters.courseType : undefined,
              sortBy: "courseId",
              order: "ASC",
            });

            if (response.success) {
              setCourses(response.data.courses || []);
              setTotalPages(response.data.pagination?.pages || 1);
            }
          } catch (error) {
            toast.error("Failed to refresh course list.");
            setCourses([]);
          }
          finally {
            setLoading(false);
          }
        };
        fetchCourses();
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      serviceType: "All Types",
      batchType: "All",
      courseType: "All",
    });
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
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search course name..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {filters.search && (
                <button 
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Select
              value={filters.serviceType}
              onValueChange={(v) => handleFilterChange("serviceType", v)}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Service Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                {serviceTypesList.map((type, index) => (
                  <SelectItem 
                    key={type} 
                    value={type} 
                    className={`text-left ${index % 2 === 0 ? "bg-muted/30" : "bg-card"}`}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.batchType}
              onValueChange={(v) => handleFilterChange("batchType", v)}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Batch Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                <SelectItem value="All" className="text-left bg-muted/30">All Batches</SelectItem>
                <SelectItem value="Weekend" className="text-left bg-card">Weekend</SelectItem>
                <SelectItem value="Weekdays" className="text-left bg-muted/30">Weekdays</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.courseType}
              onValueChange={(v) => handleFilterChange("courseType", v)}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Course Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                <SelectItem value="All" className="text-left bg-muted/30">All Types</SelectItem>
                <SelectItem value="Online" className="text-left bg-card">Online</SelectItem>
                <SelectItem value="Offline" className="text-left bg-muted/30">Offline</SelectItem>
              </SelectContent>
            </Select>

            </div>
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap transition-all px-2 self-center"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          {loading ? (
            <PageLoader className="py-8" />
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
                  <th className="table-header-cell font-bold text-black">Batch Type</th>
                  <th className="table-header-cell font-bold text-black">Course Type</th>
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
                      {course.courseId || courseId}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <Link
                        to={`/courses/${courseId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {course.courseName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{course.serviceType}</td>
                    <td className="px-4 py-3 text-foreground">{course.batchType}</td>
                    <td className="px-4 py-3 text-foreground">{course.courseType}</td>
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
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex gap-1">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9 h-9 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
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
