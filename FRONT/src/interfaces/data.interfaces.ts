import { Role } from "./enums";

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