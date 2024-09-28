"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import NewProductModal from "@/components/NewProductModal";
import ProductListItem from "@/components/ProductListItem";
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { desactivateProduct, postProduct } from "@/services/ProductService";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService";
import { toast } from "react-toastify";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";

const AdminProductsPage: React.FC = () => {
    const { data, loading, error } = useApi<IProductData[]>('/allProducts');
    const [brands, setBrands] = useState<IBrandData[]>([]);
    const [categories, setCategories] = useState<ICategoryData[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await getAllActiveBrands();
                setBrands(data);
            } catch (err) {
                toast.error("Error al cargar las marcas. Por favor, intente de nuevo más tarde.");
            }
        };

        loadBrands();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            if (selectedBrand) {
                try {
                    const data = await fetchCategoriesByBrand(selectedBrand);
                    setCategories(data);
                } catch (err) {
                    toast.error("Error al cargar las categorías. Por favor, intente de nuevo más tarde.");
                }
            } else {
                setCategories([]);
            }
        };

        loadCategories();
    }, [selectedBrand]);

    const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const brandId = Number(event.target.value);
        setSelectedBrand(brandId || null);
        setSelectedCategory(null);
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = Number(event.target.value);
        setSelectedCategory(categoryId || null);
    };

    const handleNewProduct = async (newProduct: Partial<IProductData>) => {
        try {
            await postProduct(newProduct);
            toast.success("Product created successfully.");
            window.location.reload();
        } catch (error) {
            toast.error("Error creating the product. Please try again later.");
        }
    };

    const handleEditProduct = (product: IProductData) => {
        // Lógica para editar el producto
    };

    const handleDeleteProduct = async (productId: number) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                await desactivateProduct(productId);
                toast.success("Product deleted successfully.");
                window.location.reload();
            }
        } catch (error) {
            toast.error("Error deleting the product. Please try again later.");
        }
    };

    const handleReactivateProduct = (productId: number) => {
        // Lógica para reactivar el producto
    };

    return (
        <main className="container mx-auto px-4 py-8" style={{ minHeight: "100vh" }}>
            <h1 className="text-3xl flex justify-center font-semibold text-gray-800 mb-6">Admin Products</h1>
            <div className="mb-6 flex items-center space-x-4">
                <select
                    value={selectedBrand?.toString() || ""}
                    onChange={handleBrandChange}
                    className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">All brands</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedCategory?.toString() || ""}
                    onChange={handleCategoryChange}
                    className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    disabled={!selectedBrand}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 12h8"/>
                        <path d="M12 8v8"/>
                    </svg>
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="text-center py-10 text-red-500">{error.message}</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="text-center">
                            <th className="py-2">Image</th>
                            <th className="py-2">Name</th>
                            <th className="py-2">Price</th>
                            <th className="py-2">Stock</th>
                            <th className="py-2">Active</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((product) => (
                                <ProductListItem key={product.id} product={product} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onReactive={handleReactivateProduct} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-600">
                                    No hay productos disponibles con los filtros seleccionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            <NewProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleNewProduct}
            />
        </main>
    );
};

export default AdminProductsPage;