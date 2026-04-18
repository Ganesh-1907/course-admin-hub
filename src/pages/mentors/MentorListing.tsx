import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Filter, Search, UserPlus, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMentors } from "@/services/api";
import type { Mentor } from "@/types/mentor";
import { toast } from "sonner";

const itemsPerPage = 10;

const getMentorTimestamp = (mentor: Mentor) => {
  const parsedTime = mentor.createdAt ? new Date(mentor.createdAt).getTime() : Number.NaN;
  return Number.isFinite(parsedTime) ? parsedTime : 0;
};

const sortMentorsNewestFirst = (mentorRows: Mentor[]) => (
  [...mentorRows].sort((firstMentor, secondMentor) => {
    const createdAtDifference = getMentorTimestamp(secondMentor) - getMentorTimestamp(firstMentor);

    if (createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return secondMentor.id - firstMentor.id;
  })
);

const MentorListing = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
  });

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);

      try {
        const response = await getAllMentors(currentPage, itemsPerPage, {
          search: filters.search || undefined,
          isActive: filters.status === "All" ? undefined : filters.status === "Active",
          sortBy: "createdAt",
          order: "DESC",
        });

        if (response.success) {
          setMentors(sortMentorsNewestFirst(response.data?.mentors || []));
          setTotalPages(Math.max(response.data?.pagination?.pages || 0, 1));
          return;
        }

        toast.error(response.message || "Failed to load mentors");
        setMentors([]);
        setTotalPages(1);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load mentors");
        setMentors([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [currentPage, filters]);

  const handleSearchChange = (value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      search: value,
    }));
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      status: value,
    }));
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Mentor Listing</h1>
            <p className="page-subtitle">View mentors, edit details, and keep the newest additions at the top.</p>
          </div>
          <Button onClick={() => navigate("/mentors/add")}>
            <UserPlus className="h-4 w-4" />
            Add New Mentor
          </Button>
        </div>

        <div className="admin-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="grid flex-grow grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search mentor name, designation, specialization..."
                  value={filters.search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="pl-10 pr-10"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                  <SelectItem value="All" className="text-left bg-muted/30">All Mentors</SelectItem>
                  <SelectItem value="Active" className="text-left bg-card">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-left bg-muted/30">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="self-center whitespace-nowrap px-2 text-sm font-medium text-blue-600 transition-all hover:text-blue-700 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="table-container overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading mentors...</div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No mentors found</div>
            </div>
          ) : (
            <table className="w-full min-w-[860px]">
              <thead>
                <tr>
                  <th className="table-header-cell font-bold text-black">Mentor ID</th>
                  <th className="table-header-cell font-bold text-black">Mentor Name</th>
                  <th className="table-header-cell font-bold text-black">Specialization</th>
                  <th className="table-header-cell font-bold text-black">Designation</th>
                  <th className="table-header-cell font-bold text-black">Experience</th>
                  <th className="table-header-cell font-bold text-black">Rating</th>
                  <th className="table-header-cell font-bold text-black">Status</th>
                  <th className="table-header-cell text-right font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor) => (
                  <tr key={mentor.id} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">#{mentor.id}</td>
                    <td className="px-4 py-3 text-foreground">
                      <div className="space-y-1">
                        <p className="font-medium">{mentor.name}</p>
                        {mentor.linkedinId && (
                          <p className="text-xs text-muted-foreground">LinkedIn: {mentor.linkedinId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{mentor.specialization}</td>
                    <td className="px-4 py-3 text-foreground">{mentor.designation}</td>
                    <td className="px-4 py-3 text-foreground">{mentor.yearsOfExperience} years</td>
                    <td className="px-4 py-3 text-foreground">
                      {mentor.rating !== null && mentor.rating !== undefined ? (
                        <Badge variant="secondary">{mentor.rating.toFixed(1)}</Badge>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={mentor.isActive ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                        {mentor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => navigate(`/mentors/${mentor.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && mentors.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, index, pages) => (
                    <div key={page} className="flex gap-1">
                      {index > 0 && pages[index - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-9 w-9 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MentorListing;
