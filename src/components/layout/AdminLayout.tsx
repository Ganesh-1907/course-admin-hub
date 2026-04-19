import { ReactNode } from "react";
import Navbar from "./Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
