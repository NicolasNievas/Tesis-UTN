"use client"
import Line from "@/components/atoms/Line";
import AdminFAQ from "@/components/organisms/AdminFAQ";
import { withAdmin } from "@/hoc/isAdmin";

const AdminPage = () => {
    return (
      <div className="admin-container">
        <h1 className="text-3xl font-bold mb-5">Admin Panel</h1>
        <Line />
        <p className="mb-8">Welcome to the administration panel. Use the menu to navigate through the different sections.</p>
        <AdminFAQ />
      </div>
    );
  };
  
  export default withAdmin(AdminPage);
  