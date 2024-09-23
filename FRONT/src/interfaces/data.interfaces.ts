export interface IProductData{
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    brandId: number;
    categoryId: number;
}

export interface IBrandData{
    id: number;
    name: string;
}

export interface ICategoryData{
    id: number;
    name: string;
}