import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Eye, Mail, Phone, Calendar, Briefcase, ExternalLink, Loader2, Search } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getAllApplications, updateApplicationStatus, getAllCareersAction } from "@/services/api";

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    jobId: "All",
    status: "All",
    search: "",
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCareers();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, filters]);

  const fetchCareers = async () => {
    try {
      const response = await getAllCareersAction(1, 100);
      if (response.success) setCareers(response.data.careers || []);
    } catch (error) {
      console.error("Failed to fetch careers for filter");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await getAllApplications(currentPage, itemsPerPage, {
        jobId: filters.jobId !== "All" ? filters.jobId : undefined,
        status: filters.status !== "All" ? filters.status : undefined,
      });

      if (response.success) {
        // Simple client-side search since we have small amount of data
        let resData = response.data.applications || [];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          resData = resData.filter((app: any) => 
            app.fullName?.toLowerCase().includes(s) || 
            app.email?.toLowerCase().includes(s)
          );
        }
        setApplications(resData);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await updateApplicationStatus(id, newStatus);
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
        if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "REVIEWED": return "bg-blue-100 text-blue-700";
      case "INTERVIEWED": return "bg-purple-100 text-purple-700";
      case "HIRED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/careers")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Job Applications</h1>
            <p className="page-subtitle">Track and review candidate submissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.jobId} onValueChange={(v) => setFilters({ ...filters, jobId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Jobs</SelectItem>
                {careers.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
                <SelectItem value="HIRED">Hired</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={() => setFilters({ jobId: "All", status: "All", search: "" })} className="text-blue-600">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-muted-foreground">No applications match your filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header-cell">Candidate</th>
                  <th className="table-header-cell">Applied For</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{app.fullName}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <Briefcase className="w-3.5 h-3.5" />
                        {app.careerTitle || "Unknown Position"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                        <Eye className="w-4 h-4 mr-2" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Review Application</DialogTitle>
            <DialogDescription>Candidate details and application materials</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                  <p className="font-bold text-slate-900">{selectedApp.fullName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Application Status</span>
                  <div className="flex items-center gap-2">
                    <Select defaultValue={selectedApp.status} onValueChange={(v) => handleStatusUpdate(selectedApp.id, v)}>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                  <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedApp.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedApp.phoneNumber}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Applied for {selectedApp.careerTitle}
                </h4>
                <p className="text-xs text-muted-foreground">Submitted on {new Date(selectedApp.createdAt).toLocaleString()}</p>
              </div>

              {selectedApp.resumeUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Application Documents</h4>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}${selectedApp.resumeUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg group hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white p-2 rounded">
                        <Download className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-blue-800">Candidate_Resume.pdf</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                  </a>
                </div>
              )}

              {selectedApp.coverLetter && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Cover Letter</h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                    "{selectedApp.coverLetter}"
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedApp(null)}>Close Review</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Applications;
