"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import NewProductModal from "@/components/NewProductModal";
import ProductListItem from "@/components/ProductListItem";
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { fetchActiveProducts, fetchProductByBrand, fetchProductByCategory, postProduct } from "@/services/ProductService";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService";
import { toast } from "react-toastify";

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<IProductData[]>([]);
    const [brands, setBrands] = useState<IBrandData[]>([]);
    const [categories, setCategories] = useState<ICategoryData[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([loadProducts(), loadBrands()]);
            } catch (err) {
                setError("Error al cargar los datos iniciales. Por favor, intente de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (selectedBrand) {
                    await loadCategories(selectedBrand);
                    await loadProductsByBrand(selectedBrand);
                } else {
                    setCategories([]);
                    await loadProducts();
                }
            } catch (err) {
                setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedBrand]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedBrand) {
                setLoading(true);
                setError(null);
                try {
                    if (selectedCategory) {
                        await loadProductsByCategory(selectedCategory);
                    } else {
                        await loadProductsByBrand(selectedBrand);
                    }
                } catch (err) {
                    setError("Error al cargar los productos. Por favor, intente de nuevo más tarde.");
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [selectedCategory]);

    const loadProducts = async () => {
        const data = await fetchActiveProducts();
        setProducts(data);
    };

    const loadBrands = async () => {
        const data = await getAllActiveBrands();
        setBrands(data);
    };

    const loadCategories = async (brandId: number) => {
        const data = await fetchCategoriesByBrand(brandId);
        setCategories(data);
    };

    const loadProductsByBrand = async (brandId: number) => {
        const data = await fetchProductByBrand(brandId);
        setProducts(data);
    };

    const loadProductsByCategory = async (categoryId: number) => {
        const data = await fetchProductByCategory(categoryId);
        setProducts(data);
    };

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
        try{
            await postProduct(newProduct);
            toast.success("Product created successfully.");
            loadProducts();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Error creating the product. Please try again later.");
        }
    };

    const handleEditProduct = (product: IProductData) => {
        // Lógica para editar el producto
    };

    const handleDeleteProduct = (productId: number) => {
        // Lógica para eliminar el producto
    };

    const handleReactivateProduct = (productId: number) => {

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
                <p className="text-center py-10 text-red-500">{error}</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="text-center">
                            <th className="py-2">Image</th>
                            <th className="py-2">Name</th>
                            <th className="py-2">Price</th>
                            <th className="py-2">Stock</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
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