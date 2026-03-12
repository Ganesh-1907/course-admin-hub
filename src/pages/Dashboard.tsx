import { useState, useEffect, useRef } from "react";
import { BookOpen, Users, DollarSign, TrendingUp, Loader, FileDown, Calendar as CalendarIcon } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getDashboardStats, getServiceTypes } from "@/services/api";

const COLORS = ["hsl(210, 100%, 45%)", "hsl(200, 85%, 55%)", "hsl(180, 70%, 45%)", "hsl(160, 60%, 45%)", "hsl(145, 65%, 42%)", "hsl(38, 92%, 50%)"];

const Dashboard = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [registrationData, setRegistrationData] = useState<any[]>([]);
  const [courseTypeData, setCourseTypeData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [serviceTypesList, setServiceTypesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    type: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  // Temporary filters state (for inputs)
  const [tempType, setTempType] = useState("all");
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>();
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>();
  
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const filters = {
        type: appliedFilters.type,
        startDate: appliedFilters.startDate ? format(appliedFilters.startDate, "yyyy-MM-dd") : undefined,
        endDate: appliedFilters.endDate ? format(appliedFilters.endDate, "yyyy-MM-dd") : undefined,
      };
      
      const statsResponse = await getDashboardStats(filters);
      
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        
        setStats([
          {
            title: "Total Courses",
            value: data.courses?.total ?? "0",
            icon: BookOpen,
          },
          {
            title: "Total Registrations",
            value: data.registrations?.total ?? "0",
            icon: Users,
          },
          {
            title: "Total Participants",
            value: data.participants?.total ?? "0",
            icon: Users,
          },
          {
            title: "Total Revenue",
            value: `$${data.payments?.totalRevenue ?? 0}`,
            icon: DollarSign,
          },
          {
            title: "Active Courses",
            value: data.courses?.active ?? "0",
            icon: TrendingUp,
          },
        ]);
        
        setRegistrationData(Array.isArray(data.registrationsOverTime) ? data.registrationsOverTime : []);
        setCourseTypeData(Array.isArray(data.coursesByType) ? data.coursesByType : []);
        setTopCourses(Array.isArray(data.topCourses) ? data.topCourses : []);
      } else {
        toast.error("Failed to load dashboard stats. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to connect to service. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchServiceTypesList = async () => {
      try {
        const response = await getServiceTypes();
        if (response.success && response.data) {
          const names = response.data.map((st: any) => st.name);
          setServiceTypesList(names);
        }
      } catch (error) {
        console.error("Failed to fetch service types:", error);
      }
    };
    fetchServiceTypesList();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      type: tempType,
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
  };

  const handleClearFilters = () => {
    setTempType("all");
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setAppliedFilters({
      type: "all",
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    toast.info("Preparing PDF...");
    
    try {
      const element = dashboardRef.current;
      // Temporarily hide buttons for export
      const buttons = element.querySelectorAll("button:not(.stat-icon button)");
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        ignoreElements: (el) => {
          return el.tagName === "BUTTON" && !el.closest(".stat-card");
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dashboard-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Dashboard exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export dashboard as PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - Fixed to exclude from PDF capture if needed, but we'll capture everything */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your course management</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={tempType} onValueChange={setTempType} disabled={isExporting}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl overflow-y-auto max-h-60">
                <SelectItem value="all" className="text-left bg-muted/30">All Types</SelectItem>
                {serviceTypesList.map((type, index) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className={`text-left ${(index + 1) % 2 === 0 ? "bg-muted/30" : "bg-card"}`}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !tempStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempStartDate ? format(tempStartDate, "PPP") : <span>Start Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !tempEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempEndDate ? format(tempEndDate, "PPP") : <span>End Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Button onClick={handleApplyFilters} className="bg-primary hover:bg-primary/90">
                Apply Filters
              </Button>
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area to be Captured in PDF */}
        <div ref={dashboardRef} className="space-y-6">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="stat-icon">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts and Top Courses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courses by Type */}
                <div className="admin-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Courses by Type</h3>
                  {courseTypeData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={courseTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {courseTypeData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No course data available
                    </div>
                  )}
                </div>

                {/* Top Courses */}
                <div className="admin-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Top Courses (by Registrations)</h3>
                  {topCourses.length > 0 ? (
                    <div className="space-y-4">
                      {topCourses.map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{course.name}</p>
                              <p className="text-xs text-muted-foreground">{course.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">{course.count}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Registrations</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No registration data available
                    </div>
                  )}
                </div>
              </div>

              {/* Registrations Over Time */}
              <div className="admin-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Registrations Over Time</h3>
                {registrationData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={registrationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="registrations"
                          stroke="hsl(210, 100%, 45%)"
                          strokeWidth={3}
                          dot={{ fill: "hsl(210, 100%, 45%)", strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No registration data available
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && (
          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleExportPDF} 
              disabled={isExporting}
              size="lg"
              className="flex items-center gap-2 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
              Export Full Dashboard to PDF
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
