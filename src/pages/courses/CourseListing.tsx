import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const mockCourses = [
  { id: "CRS001", name: "Agile Fundamentals", mentor: "John Smith", price: 499, serviceType: "Agile", startDate: "2024-03-01", endDate: "2024-03-15" },
  { id: "CRS002", name: "SAFe Practitioner", mentor: "Sarah Johnson", price: 899, serviceType: "SAFe", startDate: "2024-03-10", endDate: "2024-03-25" },
  { id: "CRS003", name: "Project Management Pro", mentor: "Mike Wilson", price: 699, serviceType: "Project", startDate: "2024-03-15", endDate: "2024-04-01" },
  { id: "CRS004", name: "Service Excellence", mentor: "Emily Brown", price: 599, serviceType: "Service", startDate: "2024-03-20", endDate: "2024-04-05" },
  { id: "CRS005", name: "Quality Assurance Master", mentor: "David Lee", price: 799, serviceType: "Quality", startDate: "2024-04-01", endDate: "2024-04-20" },
  { id: "CRS006", name: "Generative AI Basics", mentor: "Lisa Chen", price: 1099, serviceType: "Generative AI", startDate: "2024-04-10", endDate: "2024-04-30" },
];

const CourseListing = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    courseName: "",
    mentorName: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCourses = mockCourses.filter((course) => {
    if (filters.courseName && !course.name.toLowerCase().includes(filters.courseName.toLowerCase())) return false;
    if (filters.mentorName && !course.mentor.toLowerCase().includes(filters.mentorName.toLowerCase())) return false;
    if (filters.startDate && course.startDate < filters.startDate) return false;
    if (filters.endDate && course.endDate > filters.endDate) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = () => {
    toast.success("Course deleted successfully!");
    setDeleteId(null);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search course name..."
                value={filters.courseName}
                onChange={(e) => setFilters({ ...filters, courseName: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search mentor..."
                value={filters.mentorName}
                onChange={(e) => setFilters({ ...filters, mentorName: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="table-header-cell">Course ID</th>
                <th className="table-header-cell">Course Name</th>
                <th className="table-header-cell">Mentor</th>
                <th className="table-header-cell">Price</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {course.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{course.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{course.mentor}</td>
                  <td className="px-4 py-3 font-medium text-foreground">${course.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/courses/${course.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(course.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of{" "}
              {filteredCourses.length} courses
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
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
