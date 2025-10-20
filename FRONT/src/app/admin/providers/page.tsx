"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAxios } from "@/services/AdminAxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminProviderService from "@/services/AdminProviderService";
import { IProviderData, ProviderRequest } from "@/interfaces/data.interfaces";
// Si ya tenés SweetAlert2 instalado (lo vi en deps), usamos import dinámico para no romper SSR
const swal = () => import("sweetalert2").then(m => m.default);

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
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudieron cargar los proveedores");
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
    const Swal = await swal();
    const res = await Swal.fire({
      title: "¿Desactivar proveedor?",
      text: `Se desactivará ${prov.name}. Podrás reactivarlo luego.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!res.isConfirmed) return;

    try {
      await AdminProviderService.remove(prov.id);
      toast.success("Proveedor desactivado");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo desactivar");
    }
  };

  const onReactivate = async (prov: IProviderData) => {
    try {
      await AdminProviderService.reactivate(prov.id);
      toast.success("Proveedor reactivado");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo reactivar");
    }
  };

  const onSubmit = async (payload: ProviderRequest, id?: number) => {
    try {
      if (id) {
        await AdminProviderService.update(id, payload);
        toast.success("Proveedor actualizado");
      } else {
        await AdminProviderService.create(payload);
        toast.success("Proveedor creado");
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.errors?.[0]?.defaultMessage ??
        "Error guardando proveedor";
      toast.error(msg);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="mb-0">Proveedores</h3>
          <small className="text-muted">ABM de proveedores</small>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>
          <i className="bi bi-plus-lg me-1" /> Nuevo proveedor
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Buscar por nombre, email, teléfono o calle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
                <i className="bi bi-arrow-clockwise me-1" />
                {loading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>

          <ProvidersTable
            items={filtered}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onReactivate={onReactivate}
          />
        </div>
      </div>

      {showModal && (
        <ProviderModal
          show={showModal}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSubmit={onSubmit}
          editing={editing}
        />
      )}

      <ToastContainer position="bottom-right" />
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
    return <div className="text-muted">Cargando proveedores...</div>;
  }
  if (!items.length) {
    return <div className="text-muted">No hay resultados para el filtro actual.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{width: 52}}>#</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Calle</th>
            <th className="text-center" style={{width: 120}}>Estado</th>
            <th className="text-end" style={{width: 220}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td className="fw-semibold">{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>{p.street}</td>
              <td className="text-center">
                {p.isActive ? (
                  <span className="badge bg-success-subtle text-success">Activo</span>
                ) : (
                  <span className="badge bg-secondary">Inactivo</span>
                )}
              </td>
              <td className="text-end">
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(p)}>
                    <i className="bi bi-pencil-square me-1" />
                    Editar
                  </button>
                  {p.isActive ? (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p)}>
                      <i className="bi bi-trash3 me-1" />
                      Desactivar
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-outline-success" onClick={() => onReactivate(p)}>
                      <i className="bi bi-arrow-counterclockwise me-1" />
                      Reactivar
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

  const title = editing ? "Editar proveedor" : "Nuevo proveedor";

  const handleChange = (k: keyof ProviderRequest, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.street.trim()) {
      toast.warn("Completá todos los campos");
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

  // Modal estilo Bootstrap sin depender de jQuery
  return (
    <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <form onSubmit={submit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => handleChange("name", e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    maxLength={120}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    maxLength={40}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Calle</label>
                  <input
                    className="form-control"
                    value={form.street}
                    onChange={e => handleChange("street", e.target.value)}
                    maxLength={120}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}
