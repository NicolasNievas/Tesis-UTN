"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import useApi from "@/hooks/useApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService"; 

type Props = {
  params: { id: string };
};

const ProductPage: React.FC<Props> = ({ params }) => {
  const { data: product, loading: productLoading, error: productError } = useApi<IProductData>(`/getProductById/${params.id}`);
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (product) {
        try {
          const brandsData = await getAllActiveBrands();
          setBrands(brandsData);

          const categoriesData = await fetchCategoriesByBrand(product.brandId);
          setCategories(categoriesData);
        } catch (error) {
          console.error("Error fetching brands or categories:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (product) {
      fetchData();
    }
  }, [product]);

  if (productLoading || loading) {
    return <LoadingSpinner />;
  }

  if (productError) {
    console.error("Error al obtener el producto:", productError);
    notFound();
  }

  if (!product || brands.length === 0 || categories.length === 0) {
    return <p>No se pudo cargar la información del producto</p>;
  }

  const brand = brands.find(b => b.id === product.brandId);
  const category = categories.find(c => c.id === product.categoryId);

  if (!brand || !category) {
    return <p>Información de marca o categoría no encontrada</p>;
  }

  return (
    <div>
      <ProductDetail product={product} brand={brand} category={category} />
    </div>
  );
};

export default ProductPage;