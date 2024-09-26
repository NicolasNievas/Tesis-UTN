"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductPreview from "@/components/ProductPreview";
import { IProductData } from "@/interfaces/data.interfaces";
import { fetchActiveProducts } from "@/services/ProductService";
import { useState, useEffect } from "react";

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<IProductData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [skip, setSkip] = useState(0);
    
    useEffect(() => {
        const initializeData = async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([loadProducts()]);
        } catch (err) {
            setError(
            "Error al cargar los datos. Por favor, intente de nuevo más tarde."
            );
        } finally {
            setLoading(false);
        }
        };
    
        initializeData();
    }, [skip]);
    
    const loadProducts = async () => {
        try {
        const data = await fetchActiveProducts();
        setProducts(data);
        } catch (error) {
        console.error("Error loading products:", error);
        throw error;
        }
    };
    
    return (
        <main
        className="container mx-auto px-4 py-8"
        style={{ minHeight: "100vh" }}
        >
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
                <p className="text-center col-span-3 text-gray-600">
                No hay productos disponibles.
                </p>
            )}
            </div>
        )}
        </main>
    );
}

export default AdminProductsPage;