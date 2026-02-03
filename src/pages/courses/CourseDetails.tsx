import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, User, Tag, Download, Edit } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockCourse = {
  id: "CRS001",
  name: "Agile Fundamentals Masterclass",
  description: "This comprehensive course covers all the essential principles and practices of Agile methodology. Students will learn about Scrum, Kanban, and other Agile frameworks. The course includes hands-on exercises, real-world case studies, and interactive sessions with industry experts.",
  mentor: "John Smith",
  startDate: "2024-03-01",
  endDate: "2024-03-15",
  price: 499,
  discount: 20,
  finalPrice: 399.20,
  serviceType: "Agile",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
  hasBrochure: true,
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/courses")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        <div className="admin-card overflow-hidden">
          {/* Course Image */}
          <div className="h-64 w-full overflow-hidden">
            <img
              src={mockCourse.image}
              alt={mockCourse.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{mockCourse.serviceType}</Badge>
                  <span className="text-sm text-muted-foreground">ID: {mockCourse.id}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{mockCourse.name}</h1>
              </div>
              <Button onClick={() => navigate(`/courses/${id}/edit`)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Course
              </Button>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{mockCourse.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Mentor</span>
                </div>
                <p className="font-semibold text-foreground">{mockCourse.mentor}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {mockCourse.startDate} - {mockCourse.endDate}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Discount</span>
                </div>
                <p className="font-semibold text-foreground">{mockCourse.discount}% OFF</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Service Type</span>
                </div>
                <p className="font-semibold text-foreground">{mockCourse.serviceType}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Pricing Details</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Original Price</span>
                  <p className="text-lg line-through text-muted-foreground">${mockCourse.price}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <p className="text-lg text-success font-medium">-{mockCourse.discount}%</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Final Price</span>
                  <p className="text-3xl font-bold text-primary">${mockCourse.finalPrice}</p>
                </div>
              </div>
            </div>

            {/* Brochure */}
            {mockCourse.hasBrochure && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Course Brochure</p>
                  <p className="text-sm text-muted-foreground">Download the detailed course brochure</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetails;
