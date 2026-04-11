import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AddCourse from "./pages/courses/AddCourse";
import ImportCourses from "./pages/courses/ImportCourses";
import CourseListing from "./pages/courses/CourseListing";
import CourseDetails from "./pages/courses/CourseDetails";
import Registrations from "./pages/Registrations";
import Enquiries from "./pages/Enquiries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <CourseListing />
              </ProtectedRoute>
            } />
            <Route path="/courses/add" element={
              <ProtectedRoute>
                <AddCourse />
              </ProtectedRoute>
            } />
            <Route path="/courses/import" element={
              <ProtectedRoute>
                <ImportCourses />
              </ProtectedRoute>
            } />
            <Route path="/courses/:id" element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            } />
            <Route path="/courses/:id/edit" element={
              <ProtectedRoute>
                <AddCourse />
              </ProtectedRoute>
            } />
            <Route path="/registrations" element={
              <ProtectedRoute>
                <Registrations />
              </ProtectedRoute>
            } />
            <Route path="/enquiries" element={
              <ProtectedRoute>
                <Enquiries />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
