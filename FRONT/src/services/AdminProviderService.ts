import { IProviderData, ProviderRequest } from "@/interfaces/data.interfaces";
import { adminAxios } from "./AdminAxiosInstance";

const BASE = `${process.env.NEXT_PUBLIC_API_URL_ADMIN}/provider`;

async function list(): Promise<IProviderData[]> {
  const { data } = await adminAxios.get<IProviderData[]>(`${BASE}/all`);
  return data ?? [];
}

async function getById(id: number): Promise<IProviderData> {
  const { data } = await adminAxios.get<IProviderData>(`${BASE}/${id}`);
  return data;
}

async function create(payload: ProviderRequest): Promise<IProviderData> {
  const { data } = await adminAxios.post<IProviderData>(`${BASE}/create`, payload);
  return data;
}

async function update(id: number, payload: ProviderRequest): Promise<IProviderData> {
  const { data } = await adminAxios.put<IProviderData>(`${BASE}/update/${id}`, payload);
  return data;
}

async function remove(id: number): Promise<void> {
  await adminAxios.delete(`${BASE}/delete/${id}`); // 204
}

async function reactivate(id: number): Promise<IProviderData> {
  const { data } = await adminAxios.put<IProviderData>(`${BASE}/reactivate/${id}`);
  return data;
}

const ProviderService = { list, getById, create, update, remove, reactivate };
export default ProviderService;
