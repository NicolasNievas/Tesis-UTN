"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import NewProductModal from "@/components/organisms/NewProductModal";
import ProductListItem from "@/components/molecules/ProductListItem";
import EditProductModal from "@/components/organisms/EditProductModal";
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { desactivateProduct, postProduct, reactivateProduct, updateProduct } from "@/services/AdminProductService";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService";
import { toast } from "react-toastify";
import useAdminApi from "@/hooks/UseAdminApi";
import Swal from "sweetalert2";
import { withAdmin } from "@/hoc/isAdmin";
import Line from "@/components/atoms/Line";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminProductsPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    //const { data: products, loading, error } = useAdminApi<IProductData[]>('/products/allProducts');
    const { data: products, loading, error } = useAdminApi<{
        content: IProductData[];
        totalPages: number;
        totalElements: number;
    }>(`/products/allProducts?page=${currentPage}&size=${pageSize}`);
    const [brands, setBrands] = useState<IBrandData[]>([]);
    const [categories, setCategories] = useState<ICategoryData[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<IProductData | null>(null);
    const [filterNoStock, setFilterNoStock] = useState(false);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await getAllActiveBrands();
                setBrands(data);
            } catch (err) {
                console.log(err);
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
                    console.log(err);
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
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
            toast.error("Error creating the product. Please try again later.");
        }
    };

    const handleEditProduct = async (updatedProduct: Partial<IProductData>) => {
        try {
            await updateProduct(updatedProduct);
            toast.success("Product updated successfully.");
            setIsEditModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
            toast.error("Error updating the product. Please try again later.");
        }
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
            console.log(error);
            toast.error("Error deleting the product. Please try again later.");
        }
    };

    const handleReactivateProduct = async (productId: number) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You are about to reactivate this product.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, reactivate it!",
            });

            if (result.isConfirmed) {
                await reactivateProduct(productId);
                toast.success("Product reactivated successfully.");
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
            toast.error("Error reactivating the product. Please try again later.");
        }
    };

    const filteredProducts = products?.content?.filter(product => {
        if (selectedBrand && product.brandId !== selectedBrand) {
            return false;
        }
        if (selectedCategory && product.categoryId !== selectedCategory) {
            return false;
        }
        if (filterNoStock && product.stock > 0) {
            return false;
        }
        return true;
    });

    const openEditModal = (product: IProductData) => {
        setCurrentProduct(product);
        setIsEditModalOpen(true);
    };

    return (
        <main className="container mx-auto px-4 py-8" style={{ minHeight: "100vh" }}>
            <div className="flex items-center justify-between">
            <h1 className="text-3xl flex justify-center font-semibold text-gray-800 mb-6">Admin Products</h1>
            <span className="text-sm text-gray-500 right-48 ">Total Products: {products?.content?.length}</span>
            </div>
            <Line />
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
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <span className="font-medium">New Product</span>
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="text-center py-10 text-red-500">{error.message}</p>
            ) : (
                <>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="text-center">
                            <th className="py-2">Image</th>
                            <th className="py-2">Name</th>
                            <th className="py-2">Price</th>
                            <th className="py-2">Stock</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts && filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="text-center">
                                    <td className="py-2">
                                        <img 
                                            src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '/placeholder-image.png'}
                                            alt={product.name} 
                                            className="w-16 h-16 object-cover mx-auto rounded-md"
                                        />
                                    </td>
                                    <td className="py-2 font-medium">{product.name}</td>
                                    <td className="py-2">${product.price?.toFixed(2) || '0.00'}</td>
                                    <td className="py-2">
                                        <span className={`font-medium ${product.stock <= 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        {product.active ? (
                                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex justify-center space-x-2">
                                            {/* Botón Editar */}
                                            <button 
                                                onClick={() => openEditModal(product)}
                                                className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600 border border-yellow-600 transition-colors"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                                </svg>
                                            </button>

                                            {/* Condicional: Desactivar o Reactivar */}
                                            {product.active ? (
                                                <button 
                                                    onClick={() => handleDeleteProduct(product.id!)}
                                                    className="bg-red-500 p-2 rounded-md hover:bg-red-600 border border-red-600 transition-colors"
                                                    title="Deactivate"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16">
                                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleReactivateProduct(product.id!)}
                                                    className="bg-green-500 p-2 rounded-md hover:bg-green-600 border border-green-600 transition-colors"
                                                    title="Reactivate"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/>
                                                        <path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-600">
                                    No hay productos disponibles con los filtros seleccionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {products && products.totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-700">
                        Showing {products.content.length} of {products.totalElements} products
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage + 1} of {products.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= products.totalPages - 1}
                            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                )}

                </>
            )}

            <NewProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleNewProduct}
            />
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditProduct}
                product={currentProduct}
                brands={brands}
            />
        </main>
    );
};

export default withAdmin(AdminProductsPage);