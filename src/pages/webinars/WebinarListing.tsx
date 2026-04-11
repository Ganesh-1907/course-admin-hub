import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, Filter, Search, Video, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { COUNTRY_OPTIONS } from "@/constants/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMentors, getAllWebinars } from "@/services/api";
import type { Mentor } from "@/types/mentor";
import type { Webinar } from "@/types/webinar";
import { toast } from "sonner";

const itemsPerPage = 10;

const formatWebinarDate = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleDateString();
};

const formatWebinarTime = (value: string) => {
  const normalizedValue = String(value || "").slice(0, 5);
  if (!normalizedValue) return "N/A";

  const parsedDate = new Date(`1970-01-01T${normalizedValue}:00`);
  return Number.isNaN(parsedDate.getTime())
    ? normalizedValue
    : parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const WebinarListing = () => {
  const navigate = useNavigate();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    location: "All",
  });

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await getAllMentors(1, 500, {
          sortBy: "name",
          order: "ASC",
        });

        if (response.success) {
          setMentors(response.data?.mentors || []);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load mentors");
      }
    };

    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchWebinars = async () => {
      setLoading(true);

      try {
        const response = await getAllWebinars(currentPage, itemsPerPage, {
          search: filters.search || undefined,
          location: filters.location !== "All" ? filters.location : undefined,
          sortBy: "createdAt",
          order: "DESC",
        });

        if (response.success) {
          setWebinars(response.data?.webinars || []);
          setTotalPages(Math.max(response.data?.pagination?.pages || 0, 1));
          return;
        }

        toast.error(response.message || "Failed to load webinars");
        setWebinars([]);
        setTotalPages(1);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load webinars");
        setWebinars([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, [currentPage, filters]);

  const mentorNameMap = useMemo(
    () => mentors.reduce<Record<number, string>>((mentorLookup, mentor) => {
      mentorLookup[mentor.id] = mentor.name;
      return mentorLookup;
    }, {}),
    [mentors],
  );

  const getMentorName = (mentorId?: number | null) => {
    if (!mentorId) return "N/A";
    return mentorNameMap[mentorId] || `Mentor #${mentorId}`;
  };

  const handleSearchChange = (value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      search: value,
    }));
    setCurrentPage(1);
  };

  const handleLocationChange = (value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      location: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "All",
    });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Webinar Listing</h1>
            <p className="page-subtitle">Review webinar schedules, mentors, poster links, and supported locations.</p>
          </div>
          <Button onClick={() => navigate("/webinars/add")}>
            <Video className="h-4 w-4" />
            Add New Webinar
          </Button>
        </div>

        <div className="admin-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="grid flex-grow grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search webinar name..."
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

              <Select value={filters.location} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                  <SelectItem value="All" className="text-left bg-muted/30">All Locations</SelectItem>
                  {COUNTRY_OPTIONS.map((country, index) => (
                    <SelectItem key={country} value={country} className={`text-left ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
                      {country}
                    </SelectItem>
                  ))}
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
              <div className="text-muted-foreground">Loading webinars...</div>
            </div>
          ) : webinars.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No webinars found</div>
            </div>
          ) : (
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr>
                  <th className="table-header-cell font-bold text-black">Webinar Name</th>
                  <th className="table-header-cell font-bold text-black">Date</th>
                  <th className="table-header-cell font-bold text-black">Time</th>
                  <th className="table-header-cell font-bold text-black">Mentor</th>
                  <th className="table-header-cell font-bold text-black">Second Mentor</th>
                  <th className="table-header-cell font-bold text-black">Location</th>
                  <th className="table-header-cell font-bold text-black">Poster</th>
                  <th className="table-header-cell text-right font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webinars.map((webinar) => (
                  <tr key={webinar.id} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{webinar.name}</td>
                    <td className="px-4 py-3 text-foreground">{formatWebinarDate(webinar.webinarDate)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {formatWebinarTime(webinar.startTime)} - {formatWebinarTime(webinar.endTime)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{getMentorName(webinar.primaryMentorId)}</td>
                    <td className="px-4 py-3 text-foreground">{getMentorName(webinar.secondaryMentorId)}</td>
                    <td className="px-4 py-3 text-foreground">{webinar.location}</td>
                    <td className="px-4 py-3 text-foreground">
                      <a
                        href={webinar.posterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        View Poster
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => navigate(`/webinars/${webinar.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && webinars.length > 0 && totalPages > 1 && (
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

export default WebinarListing;
