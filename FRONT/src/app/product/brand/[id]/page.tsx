"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProductByBrand } from "@/services/ProductService";
import { IProductData } from "@/interfaces/data.interfaces";
import ProductPreview from "@/components/ProductPreview";
import LoadingSpinner from "@/components/LoadingSpinner";

const BrandProductsPage: React.FC = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<IProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const data = await fetchProductByBrand(Number(id));
          setProducts(data);
        } catch (err) {
          setError("No products found for this brand.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [id]);

  return (
    <main className="m-20 flex min-h-screen flex-col items-center justify-between">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-3 text-gray-600">No hay productos disponibles.</p>
          )}
        </div>
      )}
    </main>
  );
};

export default BrandProductsPage;