"use client";
import Line from "@/components/atoms/Line";
import {
  Menu, X,
  ShoppingCart, BarChart3,
  Package, Tag, FolderTree,
  Truck, FilePlus2, Boxes,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function NavItem({ href, label, Icon, onClick }: {
  href: string;
  label: string;
  Icon?: LucideIcon;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <li>
      <Link href={href} onClick={onClick}>
        <span
          className={`flex items-center gap-3 w-full p-4 rounded-md transition-colors duration-200 cursor-pointer ${
            active ? "bg-gray-700 text-white" : "hover:bg-gray-700 text-white/90"
          }`}
        >
          {Icon ? <Icon size={18} className="shrink-0" /> : null}
          <span>{label}</span>
        </span>
      </Link>
    </li>
  );
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed left-4 top-4 z-50 p-2 rounded-md bg-gray-800 text-white shadow"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-gray-800 text-white
        transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full p-6">
          <h2 className="text-2xl font-bold mb-2 text-white">Admin Panel</h2>
          <div className="mb-4"><Line /></div>

          <ul className="space-y-3 flex-grow">
            {/* Business Operations */}
            <li className="text-xs uppercase tracking-wide text-gray-400 px-2 mt-2">Business Operations</li>
            <NavItem href="/admin/orders" label="Orders" Icon={ShoppingCart} onClick={closeSidebar} />
            <NavItem href="/admin/reports" label="Reports" Icon={BarChart3} onClick={closeSidebar} />

            <div className="my-3"><Line /></div>

            {/* Product Catalog */}
            <li className="text-xs uppercase tracking-wide text-gray-400 px-2 mt-2">Product Catalog</li>
            <NavItem href="/admin/products" label="Products" Icon={Package} onClick={closeSidebar} />
            <NavItem href="/admin/brands" label="Brands" Icon={Tag} onClick={closeSidebar} />
            <NavItem href="/admin/categories" label="Categories" Icon={FolderTree} onClick={closeSidebar} />

            <div className="my-3"><Line /></div>

            {/* Procurement */}
            <li className="text-xs uppercase tracking-wide text-gray-400 px-2 mt-2">Procurement</li>
            <NavItem href="/admin/providers" label="Providers" Icon={Truck} onClick={closeSidebar} />
            <NavItem href="/admin/purchase-orders" label="Purchase Orders" Icon={FilePlus2} onClick={closeSidebar} />
            <NavItem href="/admin/stock-movements" label="Stock Movements" Icon={Boxes} onClick={closeSidebar} />
          </ul>

          <div className="mt-auto pt-4">
            <Line />
            <Link href="/admin" onClick={closeSidebar}>
              <span className="block w-full p-3 bg-gray-700 hover:bg-gray-600 text-center text-white rounded-md mt-4">
                Back to Admin Panel
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:pl-0 pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
