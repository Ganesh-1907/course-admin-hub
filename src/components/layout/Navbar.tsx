import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, BookOpen, LayoutDashboard, Users, Plus, Upload, List, MessageSquare ,UserPlus, Video ,Briefcase} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isCoursesActive = location.pathname.startsWith("/courses");
  const isEnquiriesActive = location.pathname.startsWith("/enquiries");
  const isMentorsActive = location.pathname.startsWith("/mentors");
  const isWebinarsActive = location.pathname.startsWith("/webinars");

  const handleLogout = () => {
    setShowLogoutDialog(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">Viovn Admin Dashboard</span>
            </Link>

            {/* Center Menu */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={cn("nav-link flex items-center gap-2", isActive("/dashboard") && "nav-link-active")}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "nav-link flex items-center gap-2",
                      isCoursesActive && "nav-link-active"
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    Courses
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/courses/add" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      Add Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/courses/import" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Courses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/courses" className="flex items-center gap-2 cursor-pointer">
                      <List className="w-4 h-4" />
                      Course Listing
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/registrations"
                className={cn("nav-link flex items-center gap-2", isActive("/registrations") && "nav-link-active")}
              >
                <Users className="w-4 h-4" />
                Registrations
              </Link>

              <Link
                to="/enquiries"
                className={cn("nav-link flex items-center gap-2", isEnquiriesActive && "nav-link-active")}
              >
                <MessageSquare className="w-4 h-4" />
                Enquiries
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "nav-link flex items-center gap-2",
                      isMentorsActive && "nav-link-active"
                    )}
                  >
                    <UserPlus className="w-4 h-4" />
                    Mentors
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/mentors/add" className="flex items-center gap-2 cursor-pointer">
                      <UserPlus className="w-4 h-4" />
                      Add Mentor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mentors" className="flex items-center gap-2 cursor-pointer">
                      <List className="w-4 h-4" />
                      List Mentor
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "nav-link flex items-center gap-2",
                      isWebinarsActive && "nav-link-active"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    Webinars
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/webinars/add" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      Add Webinar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/webinars" className="flex items-center gap-2 cursor-pointer">
                      <List className="w-4 h-4" />
                      List Webinar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">Admin</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden border-t border-border px-4 py-2 flex items-center justify-around">
          <Link
            to="/dashboard"
            className={cn("p-2 rounded-lg transition-colors", isActive("/dashboard") ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <Link
            to="/courses"
            className={cn("p-2 rounded-lg transition-colors", isCoursesActive ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <BookOpen className="w-5 h-5" />
          </Link>
          <Link
            to="/registrations"
            className={cn("p-2 rounded-lg transition-colors", isActive("/registrations") ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <Users className="w-5 h-5" />
          </Link>
          <Link
            to="/enquiries"
            className={cn("p-2 rounded-lg transition-colors", isEnquiriesActive ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <MessageSquare className="w-5 h-5" />
            to="/mentors"
            className={cn("p-2 rounded-lg transition-colors", isMentorsActive ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <UserPlus className="w-5 h-5" />
          </Link>
          <Link
            to="/webinars"
            className={cn("p-2 rounded-lg transition-colors", isWebinarsActive ? "bg-secondary text-primary" : "text-muted-foreground")}
          >
            <Video className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
