"use client";
import Line from "@/components/atoms/Line";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed  left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-64 bg-gray-800 text-white
        transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <h2 className="text-2xl font-bold mb-2 text-white">Admin Panel</h2>
          <div className="mb-4">
            <Line />
          </div>
          <ul className="space-y-4 flex-grow">
            <li>
              <Link href="/admin/orders">
                <span
                  className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                    pathname === "/admin/orders"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  Orders
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/products">
                <span
                  className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                    pathname === "/admin/products"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  Products
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/reports">
                <span
                  className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                    pathname === "/admin/reports"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  Reports
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/stock-movements">
                <span className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                  pathname === "/admin/stock-movements" ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                }`}>
                  Stock Movements
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/purchase-orders">
                <span className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                  pathname === "/admin/purchase-orders" ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                }`}>
                  Purchase Orders
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/brands">
                <span
                  className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                    pathname === "/admin/brands"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  Brands
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/categories">
                <span
                  className={`block w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
                    pathname === "/admin/categories"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  Categories
                </span>
              </Link>
            </li>
          </ul>
          <div className="mt-auto pt-4">
            <Line />
            <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
              <span className="block w-full p-3 bg-gray-700 hover:bg-gray-600 text-center text-white rounded-md mt-4">
                Back to Admin Panel
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:pl-0 pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;