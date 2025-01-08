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
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 12h8"/>
                        <path d="M12 8v8"/>
                    </svg>
                </button>
                <button onClick={() => setFilterNoStock(!filterNoStock)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter">
                        <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>
                    </svg>
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
                            <th className="py-2">Active</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts && filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <ProductListItem key={product.id} product={product} onEdit={openEditModal} onDelete={handleDeleteProduct} onReactive={handleReactivateProduct} />
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