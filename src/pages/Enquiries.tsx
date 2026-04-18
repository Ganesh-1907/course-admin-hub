import { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader, Trash2, MessageSquare, Phone, Mail, BookOpen, User, Clock, StickyNote, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { getAllEnquiries, updateEnquiryStatus, deleteEnquiry } from "@/services/api";

const STATUS_OPTIONS = ["ALL", "NEW", "CONTACTED", "CLOSED"];
const TYPE_OPTIONS = ["ALL", "GENERAL", "CONSULTATION", "CORPORATE", "ADVISOR"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW": return "bg-blue-50 text-blue-700 border-blue-200";
    case "CONTACTED": return "bg-amber-50 text-amber-700 border-amber-200";
    case "CLOSED": return "bg-green-50 text-green-700 border-green-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "NEW": return <AlertCircle className="w-3 h-3" />;
    case "CONTACTED": return <Phone className="w-3 h-3" />;
    case "CLOSED": return <CheckCircle2 className="w-3 h-3" />;
    default: return <Clock className="w-3 h-3" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "GENERAL": return "General";
    case "CONSULTATION": return "Consultation";
    case "CORPORATE": return "Corporate";
    case "ADVISOR": return "Advisor";
    default: return type;
  }
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    enquiryType: "ALL",
  });

  // Editable fields in detail modal
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const itemsPerPage = 10;

  // Fetch enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      try {
        const response = await getAllEnquiries(currentPage, itemsPerPage, {
          search: filters.search || undefined,
          status: filters.status !== "ALL" ? filters.status : undefined,
          enquiryType: filters.enquiryType !== "ALL" ? filters.enquiryType : undefined,
        });

        if (response.success) {
          setEnquiries(response.data.enquiries || []);
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalCount(response.data.pagination?.total || 0);
        } else {
          toast.error(response.message || "Failed to fetch enquiries");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch enquiries");
        setEnquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [currentPage, filters]);

  const handleViewDetail = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setEditStatus(enquiry.status || "NEW");
    setEditNotes(enquiry.adminNotes || "");
    setShowDetail(true);
  };

  const handleUpdateEnquiry = async () => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const response = await updateEnquiryStatus(String(selectedEnquiry.id), {
        status: editStatus,
        adminNotes: editNotes,
      });

      if (response.success) {
        toast.success("Enquiry updated successfully");
        // Update in local state
        setEnquiries(prev =>
          prev.map(e => e.id === selectedEnquiry.id ? { ...e, status: editStatus, adminNotes: editNotes } : e)
        );
        setSelectedEnquiry({ ...selectedEnquiry, status: editStatus, adminNotes: editNotes });
      } else {
        toast.error(response.message || "Failed to update enquiry");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update enquiry");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!deleteTarget) return;
    try {
      const response = await deleteEnquiry(String(deleteTarget.id));
      if (response.success) {
        toast.success("Enquiry deleted successfully");
        setEnquiries(prev => prev.filter(e => e.id !== deleteTarget.id));
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        if (showDetail && selectedEnquiry?.id === deleteTarget.id) {
          setShowDetail(false);
        }
      } else {
        toast.error(response.message || "Failed to delete enquiry");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete enquiry");
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="page-title">Enquiries</h1>
            <p className="page-subtitle">
              Manage lead enquiries from course pages and consultation forms
              {totalCount > 0 && <span className="ml-2 text-primary font-semibold">({totalCount} total)</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or course..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "ALL" ? "All Statuses" : opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.enquiryType} onValueChange={(value) => handleFilterChange("enquiryType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "ALL" ? "All Types" : getTypeLabel(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <MessageSquare className="w-12 h-12 text-muted-foreground/40" />
              <div className="text-muted-foreground text-lg font-medium">No enquiries found</div>
              <p className="text-sm text-muted-foreground/70">Enquiries submitted from course pages will appear here</p>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="table-header-cell font-bold text-black">Name</th>
                  <th className="table-header-cell font-bold text-black">Email</th>
                  <th className="table-header-cell font-bold text-black">Phone</th>
                  <th className="table-header-cell font-bold text-black">Course</th>
                  <th className="table-header-cell font-bold text-black">Type</th>
                  <th className="table-header-cell font-bold text-black">Status</th>
                  <th className="table-header-cell font-bold text-black">Date</th>
                  <th className="table-header-cell text-right font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-foreground font-medium">{enq.fullName || "N/A"}</p>
                        {enq.education && (
                          <p className="text-xs text-muted-foreground mt-0.5">{enq.education}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{enq.email || "N/A"}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{enq.phoneNumber || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className="text-foreground text-sm max-w-[160px] truncate block" title={enq.courseName}>
                        {enq.courseName || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {getTypeLabel(enq.enquiryType || "GENERAL")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(enq.status)}`}>
                        {getStatusIcon(enq.status)}
                        {enq.status || "NEW"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">
                      {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }) : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleViewDetail(enq)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setDeleteTarget(enq);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
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
        {!loading && enquiries.length > 0 && totalPages > 1 && (
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

      {/* Detail/Edit Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Enquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-5">
              {/* Lead Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                  <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Full Name</p>
                    <p className="font-semibold text-foreground">{selectedEnquiry.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                  <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email</p>
                    <p className="font-semibold text-foreground">{selectedEnquiry.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                  <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Phone</p>
                    <p className="font-semibold text-foreground">{selectedEnquiry.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                  <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Education</p>
                    <p className="font-semibold text-foreground">{selectedEnquiry.education || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Course & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Course Interested In</p>
                  <p className="font-semibold text-foreground">{selectedEnquiry.courseName || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Enquiry Type</p>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {getTypeLabel(selectedEnquiry.enquiryType || "GENERAL")}
                  </span>
                </div>
              </div>

              {/* Message */}
              {selectedEnquiry.message && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Message</p>
                  <div className="p-3 rounded-lg bg-accent/30 border border-border/50 text-sm text-foreground whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Submitted On</p>
                  <p className="text-foreground">
                    {selectedEnquiry.createdAt
                      ? new Date(selectedEnquiry.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : "N/A"}
                  </p>
                </div>
                {selectedEnquiry.contactedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Contacted On</p>
                    <p className="text-foreground">
                      {new Date(selectedEnquiry.contactedAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Editable Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-primary" />
                  Admin Actions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Update Status</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="NEW">NEW</SelectItem>
                        <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                        <SelectItem value="CLOSED">CLOSED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Admin Notes</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add internal notes about this enquiry..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setDeleteTarget(selectedEnquiry);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateEnquiry}
                    disabled={updating}
                    className="min-w-[120px]"
                  >
                    {updating ? <Loader className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Delete Enquiry
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this enquiry from <strong>{deleteTarget?.fullName}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEnquiry}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Enquiries;
