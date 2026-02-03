import { useState } from "react";
import { Search, Calendar, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Registration {
  id: string;
  participantName: string;
  mobile: string;
  email: string;
  courseName: string;
  paymentId: string;
  amount: number;
  status: "Paid" | "Pending";
  registrationDate: string;
}

const mockRegistrations: Registration[] = [
  { id: "REG001", participantName: "Alice Johnson", mobile: "+1 234-567-8901", email: "alice@example.com", courseName: "Agile Fundamentals", paymentId: "PAY_001234", amount: 399.20, status: "Paid", registrationDate: "2024-02-28" },
  { id: "REG002", participantName: "Bob Williams", mobile: "+1 234-567-8902", email: "bob@example.com", courseName: "SAFe Practitioner", paymentId: "PAY_001235", amount: 899, status: "Paid", registrationDate: "2024-02-27" },
  { id: "REG003", participantName: "Carol Davis", mobile: "+1 234-567-8903", email: "carol@example.com", courseName: "Project Management Pro", paymentId: "PAY_001236", amount: 699, status: "Pending", registrationDate: "2024-02-26" },
  { id: "REG004", participantName: "Daniel Miller", mobile: "+1 234-567-8904", email: "daniel@example.com", courseName: "Generative AI Basics", paymentId: "PAY_001237", amount: 1099, status: "Paid", registrationDate: "2024-02-25" },
  { id: "REG005", participantName: "Eva Martinez", mobile: "+1 234-567-8905", email: "eva@example.com", courseName: "Quality Assurance Master", paymentId: "PAY_001238", amount: 799, status: "Pending", registrationDate: "2024-02-24" },
];

const Registrations = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    courseName: "",
    participantName: "",
  });
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRegistrations = mockRegistrations.filter((reg) => {
    if (filters.courseName && !reg.courseName.toLowerCase().includes(filters.courseName.toLowerCase())) return false;
    if (filters.participantName && !reg.participantName.toLowerCase().includes(filters.participantName.toLowerCase())) return false;
    if (filters.startDate && reg.registrationDate < filters.startDate) return false;
    if (filters.endDate && reg.registrationDate > filters.endDate) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Registrations</h1>
          <p className="page-subtitle">View and manage course registrations</p>
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
                placeholder="Search course..."
                value={filters.courseName}
                onChange={(e) => setFilters({ ...filters, courseName: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search participant..."
                value={filters.participantName}
                onChange={(e) => setFilters({ ...filters, participantName: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="table-header-cell">Participant</th>
                <th className="table-header-cell">Mobile</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Course</th>
                <th className="table-header-cell">Payment ID</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{reg.participantName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{reg.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground">{reg.email}</td>
                  <td className="px-4 py-3 text-foreground">{reg.courseName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-sm">{reg.paymentId}</td>
                  <td className="px-4 py-3 font-medium text-foreground">${reg.amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={reg.status === "Paid" ? "default" : "secondary"}>
                      {reg.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
              {Math.min(currentPage * itemsPerPage, filteredRegistrations.length)} of{" "}
              {filteredRegistrations.length} registrations
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

      {/* Registration Details Modal */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedRegistration.participantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium text-foreground">{selectedRegistration.mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{selectedRegistration.email}</p>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Course Information</h4>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="font-semibold text-foreground">{selectedRegistration.courseName}</p>
                  <p className="text-sm text-muted-foreground mt-1">Registered on {selectedRegistration.registrationDate}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-sm text-foreground">{selectedRegistration.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold text-foreground">${selectedRegistration.amount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedRegistration.status === "Paid" ? "default" : "secondary"} className="mt-1">
                      {selectedRegistration.status}
                    </Badge>
                  </div>
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
