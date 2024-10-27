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
  date: number[] | string; 
  status: 'PENDING' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED';
  paymentMethodName: string;
  shippingName: string;
  customer: CustomerInfo;
  total: number;
  details: OrderDetailResponse[];
}

export interface OrderDetailResponse {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  productImage?: string;
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
}