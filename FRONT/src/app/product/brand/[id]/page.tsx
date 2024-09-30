"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductPreview from "@/components/ProductPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchCategoriesByBrand } from "@/services/brandService";
import { fetchProductByBrand, fetchProductByCategory } from "@/services/ProductService";
import { IProductData, ICategoryData } from "@/interfaces/data.interfaces";
import Button from "@/components/Button";
import { toast } from "react-toastify";


const BrandProductsPage: React.FC = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<IProductData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [productData, categoryData] = await Promise.all([
            fetchProductByBrand(Number(id)),
            fetchCategoriesByBrand(Number(id))
          ]);
          setProducts(productData);
          setCategories(categoryData);
        } catch (err) {
          toast.error("Error fetching initial data.");
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedCategory !== null) {
      const fetchProductsByCategory = async () => {
        try {
          setLoading(true);
          const data = await fetchProductByCategory(selectedCategory);
          if (data.length === 0) {
            toast.error("No products available for this category.");
          } else{
            setProducts(data);
          }
        } catch (err) {
            toast.error("Products not found.");
        } finally {
          setLoading(false);
        }
      };

      fetchProductsByCategory();
    }
  }, [selectedCategory]);

  const handleShowAllProducts = async () => {
    if (id) {
      try {
        setLoading(true);
        const data = await fetchProductByBrand(Number(id));
        setProducts(data);
        setSelectedCategory(null);
      } catch (err) {
        toast.error("Error fetching products.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="m-20 flex min-h-screen">
      <aside className="w-1/4 p-4 bg-gray-bg rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Categories</h2>
          <Button
            name="Show All"
            onClick={handleShowAllProducts}
            className="w-28 p-2 h-auto text-sm bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light"
          />
        </div>
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="mb-2">
              <button
                className="text-black hover:underline w-full text-left p-2 rounded-lg hover:bg-gray-bg-light"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="w-3/4 p-4">
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
              <p className="text-center col-span-3 text-gray-txt">No hay productos disponibles.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default BrandProductsPage;