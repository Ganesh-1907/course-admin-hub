import { useState, useEffect } from "react";
import { Search, Calendar, Eye, ChevronLeft, ChevronRight, Loader, Download } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getAllRegistrations, getRegistrationDetail, exportRegistrations } from "@/services/api";

const Registrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    courseName: "",
    participantName: "",
    status: "",
  });
  const itemsPerPage = 10;

  // Fetch registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const response = await getAllRegistrations(currentPage, itemsPerPage, {
          search: filters.participantName || filters.courseName || undefined,
          status: filters.status || undefined,
        });

        if (response.success) {
          setRegistrations(response.data.registrations || []);
          setTotalPages(response.data.pagination?.pages || 1);
        } else {
          toast.error(response.message || "Failed to fetch registrations");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch registrations");
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [currentPage, filters]);


  const handleViewDetail = async (registration: any) => {
    try {
      const response = await getRegistrationDetail(registration._id);
      if (response.success && response.data) {
        setSelectedRegistration(response.data);
        setShowDetail(true);
      } else {
        toast.error(response.message || "Failed to load registration details");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load registration details");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportRegistrations(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Registrations exported successfully");
    } catch (error) {
      toast.error("Failed to export registrations");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Registrations</h1>
          <p className="page-subtitle">View and manage course registrations</p>
        </div>

        {/* Filters */}
        <div className="admin-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search course..."
                value={filters.courseName}
                onChange={(e) => handleFilterChange("courseName", e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search participant..."
                value={filters.participantName}
                onChange={(e) => handleFilterChange("participantName", e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Input
                placeholder="Filter by status..."
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
            </div>
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">No registrations found</div>
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr>
                  <th className="table-header-cell font-bold text-black">Participant</th>
                  <th className="table-header-cell font-bold text-black">Email</th>
                  <th className="table-header-cell font-bold text-black">Mobile</th>
                  <th className="table-header-cell font-bold text-black">Course</th>
                  <th className="table-header-cell font-bold text-black">Amount</th>
                  <th className="table-header-cell font-bold text-black">Status</th>
                  <th className="table-header-cell font-bold text-black">Registered Date</th>
                  <th className="table-header-cell text-right font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {registrations.map((reg) => (
                  <tr key={reg._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-foreground font-medium">{reg.participantId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-foreground">{reg.participantId?.email || "N/A"}</td>
                    <td className="px-4 py-3 text-foreground">{reg.participantId?.mobile || "N/A"}</td>
                    <td className="px-4 py-3 text-foreground">{reg.courseId?.courseName || "N/A"}</td>
                    <td className="px-4 py-3 text-foreground">{reg.currency} {reg.finalAmount || 0}</td>
                    <td className="px-4 py-3">
                      <span className={
                        reg.registrationStatus === "COMPLETED" || reg.registrationStatus === "CONFIRMED" ? "font-semibold text-green-600" :
                        reg.registrationStatus === "CANCELLED" || reg.registrationStatus === "REFUNDED" ? "font-semibold text-red-600" :
                        "font-semibold text-orange-600"
                      }>
                        {reg.registrationStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewDetail(reg)}
                        >
                          <Eye className="w-4 h-4" />
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
        {!loading && registrations.length > 0 && totalPages > 1 && (
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

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Participant Name</p>
                  <p className="font-semibold">{selectedRegistration.participantId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedRegistration.participantId?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{selectedRegistration.participantId?.mobile || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Name</p>
                  <p className="font-semibold">{selectedRegistration.courseId?.courseName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{selectedRegistration.currency} {selectedRegistration.finalAmount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={
                    selectedRegistration.registrationStatus === "COMPLETED" || selectedRegistration.registrationStatus === "CONFIRMED" ? "font-semibold text-green-600" :
                    selectedRegistration.registrationStatus === "CANCELLED" || selectedRegistration.registrationStatus === "REFUNDED" ? "font-semibold text-red-600" :
                    "font-semibold text-orange-600"
                  }>
                    {selectedRegistration.registrationStatus || "PENDING"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-semibold">
                    {selectedRegistration.createdAt ? new Date(selectedRegistration.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-semibold">{selectedRegistration.paymentId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Mode</p>
                   <p className="font-semibold">{selectedRegistration.paymentMode || "N/A"}</p>
                </div>
                 <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                   <p className="font-semibold">{selectedRegistration.registrationNumber || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Registrations;
