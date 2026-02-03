import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Info } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ImportCourses = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setStatus("idle");
      } else {
        toast.error("Please upload a valid Excel file (.xls or .xlsx)");
      }
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    // Simulate upload
    setStatus("success");
    toast.success("Courses imported successfully!");
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="page-title">Import Courses</h1>
          <p className="page-subtitle">Bulk upload courses from an Excel file</p>
        </div>

        <div className="admin-card p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-2">File Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>File must be in .xls or .xlsx format</li>
                  <li>First row should contain column headers</li>
                  <li>Required columns: Course Name, Description, Mentor, Start Date, End Date, Price, Service Type</li>
                  <li>Optional columns: Discount Percentage, Image URL, Brochure URL</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            {status === "success" ? (
              <div className="p-8 border-2 border-success rounded-lg bg-success/5 text-center animate-scale-in">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="font-medium text-foreground">Import Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All courses have been imported successfully.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setFile(null); setStatus("idle"); }}
                >
                  Import Another File
                </Button>
              </div>
            ) : status === "error" ? (
              <div className="p-8 border-2 border-destructive rounded-lg bg-destructive/5 text-center animate-scale-in">
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="font-medium text-foreground">Import Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  There was an error processing your file. Please check the format and try again.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setFile(null); setStatus("idle"); }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className="p-8 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-secondary/30 transition-all cursor-pointer text-center"
              >
                {file ? (
                  <>
                    <FileSpreadsheet className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to select a different file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground">Click to upload Excel file</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports .xls and .xlsx formats
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          {status === "idle" && (
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!file}>
                Import Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ImportCourses;
