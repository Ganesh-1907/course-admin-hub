import { ReactNode } from "react";
import Navbar from "./Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
