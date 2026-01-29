"use client";

import React, { useState, useId, KeyboardEvent } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronUp,
  ShoppingCart, BarChart3,
  Package, Tag, FolderTree,
  Truck, FilePlus2, Boxes
} from "lucide-react";

/** Tip: si querés desactivar el "solo una abierta", poné allowMultiple = true */
const allowMultiple = false;

type FAQItem = {
  id: string;
  title: string;
  icon?: React.ComponentType<{ size?: number | string }>;
  points: Array<{ text: string; href?: string }>;
};

type FAQGroup = {
  id: string;
  heading: string;
  items: FAQItem[];
};

const GROUPS: FAQGroup[] = [
  {
    id: "business-operations",
    heading: "Business Operations",
    items: [
      {
        id: "orders",
        title: "Order Management",
        icon: ShoppingCart,
        points: [
          { text: "View all customer orders", href: "/admin/orders" },
          { text: "Filter by status and date range", href: "/admin/orders" },
          { text: "Update order status and view details", href: "/admin/orders" },
          { text: "Paginated listing for performance", href: "/admin/orders" },
        ],
      },
      {
        id: "reports",
        title: "Reports & Analytics",
        icon: BarChart3,
        points: [
          { text: "Best-selling products", href: "/admin/reports" },
          { text: "Most used payment methods", href: "/admin/reports" },
          { text: "Sales trends over time", href: "/admin/reports" },
          { text: "Export to PDF / Excel", href: "/admin/reports" },
        ],
      },
    ],
  },
  {
    id: "product-catalog",
    heading: "Product Catalog",
    items: [
      {
        id: "products",
        title: "Product Management",
        icon: Package,
        points: [
          { text: "Create new products", href: "/admin/products" },
          { text: "Update product information", href: "/admin/products" },
          { text: "Deactivate / Reactivate products", href: "/admin/products" },
          { text: "Paginated list and out-of-stock filter", href: "/admin/products" },
        ],
      },
      {
        id: "brands",
        title: "Brand Management",
        icon: Tag,
        points: [
          { text: "Create and update brands", href: "/admin/brands" },
          { text: "Deactivate / Reactivate brands", href: "/admin/brands" },
          { text: "View full brand list", href: "/admin/brands" },
        ],
      },
      {
        id: "categories",
        title: "Category Management",
        icon: FolderTree,
        points: [
          { text: "Create categories and associate brands", href: "/admin/categories" },
          { text: "Update category details", href: "/admin/categories" },
          { text: "Deactivate / Reactivate categories", href: "/admin/categories" },
          { text: "Browse categories by brand", href: "/admin/categories" },
        ],
      },
    ],
  },
  {
    id: "procurement",
    heading: "Procurement",
    items: [
      {
        id: "providers",
        title: "Provider Management",
        icon: Truck,
        points: [
          { text: "View and search providers", href: "/admin/providers" },
          { text: "Create / Update providers", href: "/admin/providers" },
          { text: "Deactivate / Reactivate providers", href: "/admin/providers" },
        ],
      },
      {
        id: "purchase-orders",
        title: "Purchase Orders",
        icon: FilePlus2,
        points: [
          { text: "Create POs for providers", href: "/admin/purchase-orders" },
          { text: "Track provider confirmations", href: "/admin/purchase-orders" },
          { text: "Filter by status and date", href: "/admin/purchase-orders" },
        ],
      },
      {
        id: "stock-movements",
        title: "Stock Movements",
        icon: Boxes,
        points: [
          { text: "View inbound / outbound movements", href: "/admin/stock-movements" },
          { text: "Filter by type and date range", href: "/admin/stock-movements" },
          { text: "Inspect movement details", href: "/admin/stock-movements" },
        ],
      },
    ],
  },
];

function SectionCard({
  item,
  open,
  onToggle,
}: {
  item: FAQItem;
  open: boolean;
  onToggle: () => void;
}) {
  const btnId = useId();
  const panelId = `${item.id}-panel`;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  const Icon = item.icon;

  return (
    <div className="border bg-white border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
      <button
        id={btnId}
        aria-expanded={open}
        aria-controls={panelId}
        className={`w-full p-4 flex justify-between items-center 
          ${open ? "bg-black text-white" : "bg-gray-50 hover:bg-black hover:text-white"} 
          transition-all duration-200`}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3">
          {Icon ? <Icon size={18} /> : null}
          <h3 className="text-lg font-semibold">{item.title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="p-4 list-disc list-inside space-y-2">
            {item.points.map((p, i) => (
              <li key={i} className="text-gray-600 hover:text-black transition-colors duration-150 pl-2">
                {p.href ? (
                  <Link
                    className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
                    href={p.href}
                  >
                    {p.text}
                  </Link>
                ) : (
                  p.text
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const AdminFAQ = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenId(id === openId ? null : id);
    } else {
      setOpenId(id === openId ? null : id);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Intro card */}
      <div className="mb-8 bg-white border-l-4 border-black p-6 rounded-lg shadow-md max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-3">
          Administrator Guide — Coffee E-commerce
        </h2>
        <p className="text-gray-600">
          This guide summarizes the available features. Expand a section to see what you can do and jump directly to the corresponding admin page.
        </p>
      </div>

      {/* Layout por grupos completos - cada grupo se mantiene junto */}
      <div className="max-w-7xl mx-auto space-y-8">
        {GROUPS.map((group) => (
          <div key={group.id}>
            {/* Heading del grupo */}
            <h4 className="text-xs uppercase tracking-wide text-gray-400 px-1 mb-4 select-none">
              {group.heading}
            </h4>
            
            {/* Grid de items del grupo con items-start */}
            <div className="grid lg:grid-cols-2 gap-4 items-start">
              {group.items.map((item) => (
                <SectionCard
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFAQ;