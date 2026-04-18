import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock3, Loader, MapPin, UserRound, Image as ImageIcon } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWebinarById } from "@/services/api";
import type { WebinarDetails as WebinarDetailsType } from "@/types/webinar";
import { toast } from "sonner";

const formatDateValue = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleDateString();
};

const formatTimeValue = (value: string) => {
  const normalizedValue = String(value || "").slice(0, 5);
  if (!normalizedValue) return "N/A";

  const parsedDate = new Date(`1970-01-01T${normalizedValue}:00`);
  return Number.isNaN(parsedDate.getTime())
    ? normalizedValue
    : parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const WebinarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<WebinarDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebinar = async () => {
      if (!id) {
        setError("Webinar ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getWebinarById(id);

        if (response.success && response.data) {
          setWebinar(response.data);
        } else {
          setError(response.message || "Failed to load webinar");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load webinar";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !webinar) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/webinars")} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Webinars
          </Button>
          <div className="admin-card p-6 text-center">
            <p className="text-destructive mb-4">{error || "Webinar not found"}</p>
            <Button onClick={() => navigate("/webinars")}>Go to Webinars</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/webinars")} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Webinars
          </Button>
          <Button variant="outline" onClick={() => window.open(webinar.posterUrl, "_blank")} className="gap-2">
            <ImageIcon className="h-4 w-4" />
            View Poster
          </Button>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="p-8 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5">
                  Webinar
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {webinar.location}
                </Badge>
                <span className="ml-auto text-sm font-mono text-muted-foreground">#{webinar.id}</span>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">{webinar.name}</h1>
              <p className="text-muted-foreground text-lg">{webinar.description}</p>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border/60 bg-muted/25 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Webinar Date
                </div>
                <p className="text-lg font-semibold text-foreground">{formatDateValue(webinar.webinarDate)}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Webinar Time
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatTimeValue(webinar.startTime)} - {formatTimeValue(webinar.endTime)}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Webinar Location
                </div>
                <p className="text-lg font-semibold text-foreground">{webinar.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/60 bg-background p-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <UserRound className="h-4 w-4 text-primary" />
                  Primary Mentor
                </div>
                <p className="text-xl font-semibold text-foreground">{webinar.primaryMentor?.name || "N/A"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {webinar.primaryMentor?.designation || webinar.primaryMentor?.specialization || "Mentor"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background p-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <UserRound className="h-4 w-4 text-primary" />
                  Second Mentor
                </div>
                <p className="text-xl font-semibold text-foreground">{webinar.secondaryMentor?.name || "Not assigned"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {webinar.secondaryMentor
                    ? webinar.secondaryMentor.designation || webinar.secondaryMentor.specialization || "Mentor"
                    : "Optional mentor slot"}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
              <p>Created: {new Date(webinar.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(webinar.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WebinarDetails;
