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
    Brands: IBrandData;
    active: boolean;
}