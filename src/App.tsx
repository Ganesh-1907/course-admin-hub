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
import AddMentor from "./pages/mentors/AddMentor";
import MentorListing from "./pages/mentors/MentorListing";
import AddWebinar from "./pages/webinars/AddWebinar";
import WebinarDetails from "./pages/webinars/WebinarDetails";
import WebinarListing from "./pages/webinars/WebinarListing";
import Registrations from "./pages/Registrations";
import Enquiries from "./pages/Enquiries";
import CareerListing from "./pages/careers/CareerListing";
import AddCareer from "./pages/careers/AddCareer";
import Applications from "./pages/careers/Applications";
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
            <Route path="/mentors" element={
              <ProtectedRoute>
                <MentorListing />
              </ProtectedRoute>
            } />
            <Route path="/mentors/add" element={
              <ProtectedRoute>
                <AddMentor />
              </ProtectedRoute>
            } />
            <Route path="/mentors/:id/edit" element={
              <ProtectedRoute>
                <AddMentor />
              </ProtectedRoute>
            } />
            <Route path="/webinars" element={
              <ProtectedRoute>
                <WebinarListing />
              </ProtectedRoute>
            } />
            <Route path="/webinars/:id" element={
              <ProtectedRoute>
                <WebinarDetails />
              </ProtectedRoute>
            } />
            <Route path="/webinars/add" element={
              <ProtectedRoute>
                <AddWebinar />
              </ProtectedRoute>
            } />
            <Route path="/careers" element={
              <ProtectedRoute>
                <CareerListing />
              </ProtectedRoute>
            } />
            <Route path="/careers/add" element={
              <ProtectedRoute>
                <AddCareer />
              </ProtectedRoute>
            } />
            <Route path="/careers/edit/:id" element={
              <ProtectedRoute>
                <AddCareer />
              </ProtectedRoute>
            } />
            <Route path="/careers/applications" element={
              <ProtectedRoute>
                <Applications />
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
