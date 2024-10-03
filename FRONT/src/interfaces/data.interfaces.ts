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
    username: string;
    email: string;
    role: Role;
    
}


export interface AuthResponse<T> {
    response?: T;
    status: number;
    message?: string;
}