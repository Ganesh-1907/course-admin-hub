import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="admin-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">CourseAdmin</span>
            </div>
          </div>

          {submitted ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">Check Your Email</h1>
              <p className="text-muted-foreground text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-center text-foreground mb-2">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground text-center text-sm mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="form-label">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-destructive text-sm mt-1">{error}</p>}
                </div>

                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
