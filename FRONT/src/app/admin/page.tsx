"use client"
import { withAdmin } from "@/hoc/isAdmin";

const AdminPage = () => {
    return (
      <div className="admin-container">
        <h1 className="text-3xl font-bold mb-5">Admin Panel</h1>
        <p>Welcome to the administration panel. Use the menu to navigate through the different sections.</p>
      </div>
    );
  };
  
  export default AdminPage;
  