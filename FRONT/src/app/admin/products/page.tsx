"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductPreview from "@/components/ProductPreview";
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { fetchActiveProducts, fetchProductByBrand, fetchProductByCategory } from "@/services/ProductService";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService";

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<IProductData[]>([]);
    const [brands, setBrands] = useState<IBrandData[]>([]);
    const [categories, setCategories] = useState<ICategoryData[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <main className="container mx-auto px-4 py-8" style={{ minHeight: "100vh" }}>
            <div className="mb-6 flex space-x-4">
                <select
                    value={selectedBrand?.toString() || ""}
                    onChange={handleBrandChange}
                    className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Todas las marcas</option>
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
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="text-center py-10 text-red-500">{error}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductPreview key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="text-center col-span-4 text-gray-600">
                            No hay productos disponibles con los filtros seleccionados.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
};

export default AdminProductsPage;