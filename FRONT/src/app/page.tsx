"use client";
import { useState, useEffect } from "react";
import { IProductData } from "@/interfaces/data.interfaces";
import { fetchActiveProducts } from "@/services/ProductService";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import ProductPreview from "@/components/molecules/ProductPreview";

export default function Home() {
  const [products, setProducts] = useState<{
    content: IProductData[];
    totalPages: number;
    totalElements: number;
  }>({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12; // Products per page

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActiveProducts(currentPage, pageSize);
        setProducts(data);
      } catch (err) {
        setError(
          "Error al cargar los productos. Por favor, intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const totalPages = products.totalPages;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // First page button
    if (startPage > 0) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(0)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 1) {
        buttons.push(
          <span key="dots-start" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-gray-300 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        buttons.push(
          <span key="dots-end" className="px-2">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages - 1)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
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
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.content.length > 0 ? (
            products.content.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600">
              No hay productos disponibles.
            </p>
          )}
          </div>

          {/* Pagination */}
          {products.totalPages > 0 && (
            <div className="mt-8 flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-1">
                {renderPaginationButtons()}
              </div>
              {/* <p className="text-sm text-gray-500">
                Mostrando {products.content.length} de {products.totalElements} productos
              </p> */}
            </div>
          )}
        </>
      )}
    </main>
  );
}