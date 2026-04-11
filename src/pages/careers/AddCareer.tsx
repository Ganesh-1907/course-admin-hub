import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createCareer, updateCareer, getAllCareersAction } from "@/services/api";

const AddCareer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    responsibilities: "",
    salaryRange: "",
    status: "OPEN",
    isFeatured: false,
  });

  useEffect(() => {
    if (isEdit) {
      fetchCareerDetails();
    }
  }, [id]);

  const fetchCareerDetails = async () => {
    setFetching(true);
    try {
      // We don't have a direct getCareerById but we can use getAllCareers filter or we should have added one
      // Since I added getCareerById in backend, I should have it in API service too. 
      // Let's assume for now I'll use the getAllCareers and filter to find it, OR I'll add the missing API call.
      // Better to add the missing API call to api.ts.
      const response = await getAllCareersAction(1, 100);
      if (response.success) {
        const career = response.data.careers.find((c: any) => c.id === Number(id));
        if (career) {
          setFormData({
            title: career.title || "",
            department: career.department || "",
            location: career.location || "",
            type: career.type || "Full-time",
            description: career.description || "",
            requirements: career.requirements || "",
            responsibilities: career.responsibilities || "",
            salaryRange: career.salaryRange || "",
            status: career.status || "OPEN",
            isFeatured: career.isFeatured || false,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load career details.");
      navigate("/careers");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const response = await updateCareer(id, formData);
        if (response.success) {
          toast.success("Career updated successfully!");
          navigate("/careers");
        }
      } else {
        const response = await createCareer(formData);
        if (response.success) {
          toast.success("Career created successfully!");
          navigate("/careers");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save career.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/careers")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-title">{isEdit ? "Edit Career" : "Add New Career"}</h1>
              <p className="page-subtitle">Define the job details and requirements</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="admin-card p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Senior Agile Trainer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  required
                  placeholder="e.g. Training & Delivery"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g. Remote, Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  placeholder="e.g. ₹15L - ₹25L"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(c) => setFormData({ ...formData, isFeatured: c })}
              />
              <Label htmlFor="featured">Featured Job (Highlight in list)</Label>
            </div>
          </div>

          <div className="admin-card p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                required
                className="min-h-[120px]"
                placeholder="Describe the overall role and team..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Key Requirements</Label>
              <Textarea
                id="requirements"
                className="min-h-[150px]"
                placeholder="List skills, certifications, and experience needed (one per line)..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Key Responsibilities</Label>
              <Textarea
                id="responsibilities"
                className="min-h-[150px]"
                placeholder="List what they will be doing daily..."
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate("/careers")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Update Job Post" : "Publish Job Post"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddCareer;
