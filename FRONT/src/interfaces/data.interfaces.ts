import { TypeDocument } from "./enums";

export interface IProductData{
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    active: boolean;
    brandId: number;
    categoryId: number;
}

export interface IBrandData{
    id: number;
    name: string;
    active: boolean;
}

export interface ICategoryData{
    id: number;
    name: string;
    brandId: number;
    active: boolean;
}

export interface IUserData{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  role: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}
  
export interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  address: string;
  city: string;
  nroDoc: string;
  typeDoc: TypeDocument;
}
  
export interface AuthResponse {
  token: string;
}
export interface DecodedToken {
  sub: string;  
  exp: number;  
  iat: number;  
  authorities: string[]; 
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
}

export interface IContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  message?: string;
  error?: string;
}

export interface FormStatus {
  message: string;
  type: 'success' | 'error' | '';
}

// Password reset interfaces

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

// Email verification interfaces

export interface EmailVerificationRequest {
  email: string;
  code: string;
}

// Cart interfaces

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrls: string[];
  price: number;
  quantity: number;
  subtotal: number;
  availableStock: number; 
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
}

// Order Interfaces

export interface OrderResponse {
  id: number;
  paymentId: string;
  mercadoPagoOrderId: string;
  date: number[] | string; 
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED'  | 'CANCELLED';
  paymentMethodName: string;
  shippingName: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  customer: CustomerInfo;
  details: OrderDetailResponse[];
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shipmentInfo?: shipmentInfo;
}

export interface OrderDetailResponse {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROCESS = 'IN_PROCESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
}

// filtros 
export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Reports interfaces
export interface PaymentMethodReport {
  paymentMethod: string;
  orderCount: number;
  totalSales: number;
}

export interface TopProductReport {
  productName: string;
  totalQuantity: number;
  totalSales: number;
}

export interface SalesByPeriodReport {
  period: string;
  totalSales: number;
  orderCount: number;
}

export interface CustomerStatistics {
  customerId: number;
  customerName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalSpent: number;
  totalOrders: number;
}

export interface InventoryReport {
  productId: number;
  productName: string;
  currentStock: number;
  price: number;
  inventoryValue: number;
  totalSold: number;
  totalRevenue: number;
  stockStatus: string;
  turnoverRate: number;
}

export interface OrderStatistics {
  totalOrders: number;
  averageTicket: number;
  maxTicket: number;
  minTicket: number;
}

export interface OrdersByStatus {
  status: string;
  orderCount: number;
  totalAmount: number;
}

export interface ConversionRate {
  completed: number;
  cancelled: number;
  pending: number;
  total: number;
  completionRate: number;
  cancellationRate: number;
}

export interface SalesByBrand {
  brandId: number;
  brandName: string;
  itemsSold: number;
  totalQuantity: number;
  totalSales: number;
}

export interface SalesByCategory {
  categoryId: number;
  categoryName: string;
  brandName: string;
  itemsSold: number;
  totalQuantity: number;
  totalSales: number;
}

export interface ProductsWithoutMovement {
  productId: number;
  productName: string;
  stock: number;
  price: number;
  inventoryValue: number;
  lastMovementDate: string | null;
}

export interface ShippingMethodReport {
  shippingMethod: string;
  orderCount: number;
  totalSales: number;
  averageShippingCost: number;
}


export interface MonthlySalesTrend {
  month: string;
  totalSales: number;
  orderCount: number;
  averageTicket: number;
}

export interface ProductPerformanceReport {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string;
  totalSold: number;
  totalRevenue: number;
  averageRating?: number;
  returnRate?: number;
}

export interface MonthlyTrends {
  month: string;
  orderCount: number;
  totalSales: number;
  averageTicket: number;
}

export interface TopProductByPeriod {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalSales: number;
  period: string;
  periodType: string;
}

//Purchase interfaces

export interface ProviderOrderDetail {
  productId: number;
  requestedQuantity: number;
  purchasePrice: number;
}

export interface SimulatedDeliveryDetail {
  productId: number;
  productName: string;
  status: 'COMPLETE' | 'PARTIAL' | 'NOT_AVAILABLE';
  requestedQuantity: number;
  expectedQuantity: number;
  finalPrice: number;
  statusMessage: string;
}

export interface PurchaseOrderResponse {
  orderId: number;
  orderDate: string;
  status: string;
  expectedDeliveryDays: number;
  simulatedDelivery: SimulatedDeliveryDetail[];
}

export interface DeliveryConfirmationDetail {
  productId: number;
  receivedQuantity: number;
}

export interface InvoiceResponse {
  invoiceId: number;
  deliveryDate: string;
  totalAmount: number;
  details: {
    productId: number;
    productName: string;
    requestedQuantity: number;
    receivedQuantity: number;
    finalPrice: number;
    variance: number;
  }[];
}

//Provider interfaces

// export interface IProviderData {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   street: string;
// }

export type IProviderData = {
  id: number;
  name: string;
  email: string;
  phone: string;
  street: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type ProviderRequest = {
  name: string;
  email: string;
  phone: string;
  street: string;
};

// Checkout interfaces

export interface ShippingMethod {
  id: number;
  name: string;
  displayName: string;
  baseCost: number;
  description: string;
  estimatedDays: number;
  requiresPostalCode: boolean;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrls: string[];
  price: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
}

export interface CheckoutData {
  cart: {
    id: number;
    userId: number;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
    selectedShippingId: number | null;
    selectedShipping: ShippingMethod | null;
    shippingAddress: ShippingAddress | null;
  };
  availableShippingMethods: ShippingMethod[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress | null;
}

export interface UpdateShippingRequest {
  shippingMethodId?: number;
  address?: string;
  city?: string;
  postalCode?: string;
}

// Shipment interfaces

export interface ShipmentResponse {
    id: number;
    orderId: number;
    trackingCode: string;
    status: ShipmentStatus;
    carrier: string;
    createdAt: string;
    shippedAt?: string;
    estimatedDeliveryDate?: string;
    deliveredAt?: string;
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientPostalCode: string;
    recipientPhone: string;
    notes?: string;
    trackingHistory: TrackingEntry[];
}

export interface TrackingEntry {
    id: number;
    status: ShipmentStatus;
    timestamp: string;
    location: string;
    description: string;
}

export enum ShipmentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    IN_TRANSIT = 'IN_TRANSIT',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    FAILED_DELIVERY = 'FAILED_DELIVERY',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED'
}

export interface CreateShipmentRequest {
    orderId: number;
    notes?: string;
}

export interface UpdateShipmentStatusRequest {
    status: ShipmentStatus;
    location?: string;
    description?: string;
}

export interface shipmentInfo{
  shipmentId: number;
  trackingCode?: string;
  shipmentStatus: ShipmentStatus;
  estimatedDeliveryDate?: string;
  deliveredAt: string;
  hasShipment: boolean;
}