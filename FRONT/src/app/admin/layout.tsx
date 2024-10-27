"use client";
import Line from "@/components/atoms/Line";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="admin-layout flex min-h-screen">
      <nav className="admin-sidebar w-64 bg-gray-800 text-white flex flex-col p-6 shadow-lg">
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
        <div className="mt-auto">
        <Line />
          <Link href="/admin">
            <span className="block w-full p-3 bg-gray-700 hover:bg-gray-600 text-center text-white rounded-md">
              Back to Admin Panel
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-content flex-grow p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
