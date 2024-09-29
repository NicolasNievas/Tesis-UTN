import Link from "next/link";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="admin-layout flex min-h-screen">
      <nav className="admin-sidebar w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <Link href="/admin/orders" className="hover:text-gray-400">
              Orders
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="hover:text-gray-400">
              Products
            </Link>
          </li>
          <li>
            <Link href="/admin/reports" className="hover:text-gray-400">
              Reports
            </Link>
          </li>
          <li>
            <Link href="/admin/brands" className="hover:text-gray-400">
              Brands
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="hover:text-gray-400">
              Categories
            </Link>
          </li>
        </ul>
        <div className="mt-auto">
          <Link href="/admin" className="hover:text-gray-400">
            Back to Admin Panel
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
