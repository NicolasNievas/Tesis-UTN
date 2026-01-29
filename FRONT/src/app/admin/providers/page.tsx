"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminProviderService from "@/services/AdminProviderService";
import { IProviderData, ProviderRequest } from "@/interfaces/data.interfaces";
import Swal from "sweetalert2";

export default function ProvidersPage() {
  const [data, setData] = useState<IProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<IProviderData | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const items = await AdminProviderService.list();
      setData(items);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Error loading providers");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let items = data;
    if (statusFilter !== "all") {
      items = items.filter(p => (statusFilter === "active" ? p.isActive : !p.isActive));
    }
    if (!needle) return items;
    return items.filter(p =>
      [p.name, p.email, p.phone, p.street]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(needle))
    );
  }, [data, search, statusFilter]);

  const onCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const onEdit = (prov: IProviderData) => {
    setEditing(prov);
    setShowModal(true);
  };

  const onDelete = async (prov: IProviderData) => {
    // Confirmación simple con confirm nativo
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `¿Desactivar proveedor?\n\nSe desactivará ${prov.name}. Podrás reactivarlo luego.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate it!'
    })
    if (!result.isConfirmed) return;

    try {
      await AdminProviderService.remove(prov.id);
      toast.success("Supplier deactivated successfully");
      load();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Error desactivating Supplier");
    }
  };

  const onReactivate = async (prov: IProviderData) => {
  const result = await Swal.fire({
    title: '¿Reactivar proveedor?',
    text: `Se reactivará ${prov.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, reactivar',
    cancelButtonText: 'Cancelar'
  });
  
  if (!result.isConfirmed) return;

  try {
    await AdminProviderService.reactivate(prov.id);
    toast.success("Supplier reactivated successfully");
    load();
  } catch (e: unknown) {
    const error = e as { response?: { data?: { message?: string } } };
    toast.error(error?.response?.data?.message ?? "Error reactivating Supplier");
  }
};

  const onSubmit = async (payload: ProviderRequest, id?: number) => {
    try {
      if (id) {
        await AdminProviderService.update(id, payload);
        toast.success("Supplier updated successfully");
      } else {
        await AdminProviderService.create(payload);
        toast.success("Supplier created  successfully");
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string; errors?: Array<{ defaultMessage?: string }> } } };
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.errors?.[0]?.defaultMessage ??
        "Error saving Supplier";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-black mb-1">Suppliers</h3>
        </div>
        <button 
          className="bg-blue hover:bg-blue/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={onCreate}
        >
          <span className="text-xl">+</span>
          New supplier
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
            <div className="md:col-span-6">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                placeholder="Search by name, email, phone number or street address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* <div className="md:col-span-3">
              <button 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={load} 
                disabled={loading}
              >
                <span className="text-lg">↻</span>
                {loading ? "Actualizando..." : "Actualizar"}
              </button>
            </div> */}
          </div>

          {/* Table */}
          <ProvidersTable
            items={filtered}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onReactivate={onReactivate}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProviderModal
          show={showModal}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSubmit={onSubmit}
          editing={editing}
        />
      )}
    </div>
  );
}

/** ===================== Tabla ===================== */
function ProvidersTable({
  items,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: {
  items: IProviderData[];
  loading: boolean;
  onEdit: (p: IProviderData) => void;
  onDelete: (p: IProviderData) => void;
  onReactivate: (p: IProviderData) => void;
}) {
  if (loading) {
    return <div className="text-gray-txt py-8 text-center">Loading Suppliers...</div>;
  }
  if (!items.length) {
    return <div className="text-gray-txt py-8 text-center">There are no results for the current filter.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-bg border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black w-12">#</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">Phone</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-black">Street</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-black w-28">State</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-black w-56">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((p, idx) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-txt">{idx + 1}</td>
              <td className="px-4 py-3 text-sm font-semibold text-black">{p.name}</td>
              <td className="px-4 py-3 text-sm text-gray-txt">{p.email}</td>
              <td className="px-4 py-3 text-sm text-gray-txt">{p.phone}</td>
              <td className="px-4 py-3 text-sm text-gray-txt">{p.street}</td>
              <td className="px-4 py-3 text-center">
                {p.isActive ? (
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  {/* Botón Editar - Siempre visible */}
                  <button 
                    onClick={() => onEdit(p)} 
                    className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600 border border-yellow-600 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                  </button>

                  {/* Condicional: Desactivar o Reactivar */}
                  {p.isActive ? (
                    <button 
                      onClick={() => onDelete(p)} 
                      className="bg-red-500 p-2 rounded-md hover:bg-red-600 border border-red-600 transition-colors"
                      title="Deactivate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      onClick={() => onReactivate(p)} 
                      className="bg-green-500 p-2 rounded-md hover:bg-green-600 border border-green-600 transition-colors"
                      title="Reactivate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/>
                        <path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** ===================== Modal (alta/edición) ===================== */
function ProviderModal({
  show,
  onClose,
  onSubmit,
  editing,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (payload: ProviderRequest, id?: number) => Promise<void>;
  editing: IProviderData | null;
}) {
  const [form, setForm] = useState<ProviderRequest>(() => ({
    name: editing?.name ?? "",
    email: editing?.email ?? "",
    phone: editing?.phone ?? "",
    street: editing?.street ?? "",
  }));
  const [saving, setSaving] = useState(false);

  const title = editing ? "Edit Supplier" : "New Supplier";

  const handleChange = (k: keyof ProviderRequest, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.street.trim()) {
      toast.warn("Please fill in all fields");
      return;
    }
    setSaving(true);
    await onSubmit(
      {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        street: form.street.trim().toUpperCase(),
      },
      editing?.id
    ).finally(() => setSaving(false));
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h5 className="text-xl font-semibold text-black">{title}</h5>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Name</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  maxLength={80}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                    value={form.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    maxLength={40}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Street</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                  value={form.street}
                  onChange={e => handleChange("street", e.target.value)}
                  maxLength={120}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button 
              type="button" 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              onClick={onClose} 
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors disabled:opacity-50"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}