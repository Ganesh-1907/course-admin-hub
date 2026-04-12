import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Edit, ChevronLeft, ChevronRight, X, Briefcase, Plus } from "lucide-react";
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
import { getAllCareersAction, deleteCareer } from "@/services/api";

const CareerListing = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCareers();
  }, [currentPage, filters]);

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const response = await getAllCareersAction(currentPage, itemsPerPage, {
        search: filters.search || undefined,
        status: filters.status !== "All" ? filters.status : undefined,
      });

      if (response.success) {
        setCareers(response.data.careers || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      toast.error("Failed to load careers.");
      setCareers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await deleteCareer(deleteId);
      if (response.success) {
        toast.success("Career deleted successfully!");
        fetchCareers();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete career");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilters({ ...filters, status: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "All",
    });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Career Opportunities</h1>
            <p className="page-subtitle">Manage job listings and applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/careers/applications")}>
              View Applications
            </Button>
            <Button onClick={() => navigate("/careers/add")}>
              <Plus className="w-4 h-4 mr-2" /> Add Career
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search job title or department..."
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
              value={filters.status}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={clearFilters} className="text-blue-600">
              Clear All
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">Loading careers...</div>
            </div>
          ) : careers.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <Briefcase className="w-12 h-12 text-muted/30 mb-4" />
              <p className="text-muted-foreground font-medium">No career listings found</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="table-header-cell">Title</th>
                  <th className="table-header-cell">Department</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Featured</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {careers.map((career) => (
                  <tr key={career.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{career.title}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{new Date(career.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{career.department}</td>
                    <td className="px-4 py-4 text-slate-600">{career.location}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                        {career.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        className={career.status === "OPEN" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}
                      >
                        {career.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {career.isFeatured ? (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/careers/edit/${career.id}`)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(career.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && careers.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
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
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
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
            <AlertDialogTitle>Delete Career Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job post? Applications related to this job may also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CareerListing;
