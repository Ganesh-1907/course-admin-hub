import { BookOpen, Users, DollarSign, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const registrationData = [
  { month: "Jan", registrations: 45 },
  { month: "Feb", registrations: 52 },
  { month: "Mar", registrations: 78 },
  { month: "Apr", registrations: 61 },
  { month: "May", registrations: 89 },
  { month: "Jun", registrations: 94 },
];

const courseTypeData = [
  { name: "Agile", value: 35 },
  { name: "Service", value: 20 },
  { name: "SAFe", value: 15 },
  { name: "Project", value: 12 },
  { name: "Quality", value: 10 },
  { name: "Gen AI", value: 8 },
];

const COLORS = ["hsl(210, 100%, 45%)", "hsl(200, 85%, 55%)", "hsl(180, 70%, 45%)", "hsl(160, 60%, 45%)", "hsl(145, 65%, 42%)", "hsl(38, 92%, 50%)"];

const stats = [
  { title: "Total Courses", value: "124", icon: BookOpen, trend: "+12%" },
  { title: "Total Registrations", value: "1,847", icon: Users, trend: "+8.2%" },
  { title: "Total Revenue", value: "$89,420", icon: DollarSign, trend: "+15%" },
  { title: "Active Courses", value: "42", icon: TrendingUp, trend: "+5%" },
];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your course management</p>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="agile">Agile</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="safe">SAFe</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="genai">Generative AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="stat-icon">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <span className="text-xs text-success font-medium">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrations Over Time */}
          <div className="admin-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Registrations Over Time</h3>
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
          </div>

          {/* Courses by Type */}
          <div className="admin-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Courses by Type</h3>
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
