"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductPreview from "@/components/molecules/ProductPreview";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { fetchCategoriesByBrand } from "@/services/brandService";
import { fetchProductByBrand, fetchProductByCategory } from "@/services/ProductService";
import { IProductData, ICategoryData } from "@/interfaces/data.interfaces";
import Button from "@/components/atoms/Button";
import { toast } from "react-toastify";
import { Filter, DollarSign, X } from "lucide-react";

const BrandProductsPage: React.FC = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<IProductData[]>([]);
  const [allProducts, setAllProducts] = useState<IProductData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  
  // Estados para los filtros de precio
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showPriceFilter, setShowPriceFilter] = useState<boolean>(true);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

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
          setAllProducts(productData);
          setCategories(categoryData);
          
          if (productData.length > 0) {
            const prices = productData.map(p => p.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setPriceRange({ min, max });
            setMinPrice(min);
            setMaxPrice(max);
          }
        } catch (err) {
          console.log(err);
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
          } else {
            setProducts(data);
            setAllProducts(data);
            updatePriceRange(data);
          }
        } catch (err) {
          console.log(err);
          toast.error("Products not found.");
        } finally {
          setLoading(false);
        }
      };

      fetchProductsByCategory();
    }
  }, [selectedCategory]);

  // Actualizar rango de precios
  const updatePriceRange = (productsList: IProductData[]) => {
    if (productsList.length > 0) {
      const prices = productsList.map(p => p.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange({ min, max });
      setMinPrice(min);
      setMaxPrice(max);
    }
  };

  const handleShowAllProducts = async () => {
    if (id) {
      try {
        setLoading(true);
        const data = await fetchProductByBrand(Number(id));
        setProducts(data);
        setAllProducts(data);
        setSelectedCategory(null);
        updatePriceRange(data);
        resetPriceFilters();
      } catch (err) {
        console.log(err);
        toast.error("Error fetching products.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Aplicar filtros de precio
  const applyPriceFilter = () => {
    let filtered = [...allProducts];
    
    if (minPrice !== "" && !isNaN(minPrice)) {
      filtered = filtered.filter(product => product.price >= minPrice);
    }
    
    if (maxPrice !== "" && !isNaN(maxPrice)) {
      filtered = filtered.filter(product => product.price <= maxPrice);
    }
    
    setProducts(filtered);
  };

  // Resetear filtros de precio
  const resetPriceFilters = () => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setProducts(allProducts);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedCategory(null);
    resetPriceFilters();
    if (id) {
      handleShowAllProducts();
    }
  };

  // Efecto para aplicar filtros cuando cambian los precios
  useEffect(() => {
    if (allProducts.length > 0) {
      const timeoutId = setTimeout(() => {
        applyPriceFilter();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [minPrice, maxPrice]);

  return (
    <main className="m-20 flex min-h-screen">
      <aside className="w-64 p-4 bg-gray-bg rounded-lg shadow-lg sticky top-4 h-fit">
        {/* Header de filtros */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-gray-800">Filters</h2>
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        </div>

        {/* Botón para mostrar todos */}
        <div className="mb-4">
          <Button
            name="Show All"
            onClick={handleShowAllProducts}
            className="w-full py-2.5 text-xs bg-black-btn hover:bg-black-hover text-gray-bg-light"
          />
        </div>

        {/* Filtro de precio - AHORA ARRIBA */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-base text-gray-700">Price Range</h3>
            </div>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Filter className={`w-3 h-3 text-gray-500 transition-transform ${
                showPriceFilter ? "rotate-180" : ""
              }`} />
            </button>
          </div>

          {showPriceFilter && (
            <div className="space-y-3 animate-fadeIn">
              {/* Indicador de rango actual */}
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded">Min: ${priceRange.min.toFixed(0)}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">Max: ${priceRange.max.toFixed(0)}</span>
              </div>
              
              {/* Inputs en una sola fila para ahorrar espacio */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={maxPrice || priceRange.max}
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min={minPrice || priceRange.min}
                      max={priceRange.max}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción alineados */}
              <div className="flex gap-2">
                <button
                  onClick={applyPriceFilter}
                  className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply
                </button>
                <button
                  onClick={resetPriceFilters}
                  className="flex-1 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset
                </button>
              </div>

              {/* Indicador de productos filtrados */}
              {products.length !== allProducts.length && (
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <p className="text-xs text-blue-700">
                    Showing {products.length} of {allProducts.length} products
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Separador visual */}
        <div className="h-px bg-gray-200 mb-6"></div>

        {/* Filtro de categorías - AHORA ABAJO */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base text-gray-700">Categories</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {categories.length}
            </span>
          </div>
          <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 text-sm ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{category.name}</span>
                    {selectedCategory === category.id && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Información del filtro activo */}
        {(selectedCategory !== null || products.length !== allProducts.length) && (
          <div className="mt-4 p-2.5 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-medium text-gray-700 text-xs mb-1.5">Active Filters</h4>
            <div className="space-y-1">
              {(minPrice !== priceRange.min || maxPrice !== priceRange.max) && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Price:</span>
                  <span className="text-xs font-medium text-gray-800">
                    ${minPrice} - ${maxPrice}
                  </span>
                </div>
              )}
              {selectedCategory !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Category:</span>
                  <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Products
              {selectedCategory !== null && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </h1>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </div>
          </div>
          
          {products.length !== allProducts.length && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(minPrice !== priceRange.min || maxPrice !== priceRange.max) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <DollarSign className="w-3 h-3" />
                  ${minPrice} - ${maxPrice}
                  <button 
                    onClick={resetPriceFilters}
                    className="ml-1 text-blue-500 hover:text-blue-700 text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 text-green-500 hover:text-green-700 text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-center py-10 text-red-500">{error}</p>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductPreview key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <Filter className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    No products match your current filters. Try adjusting your criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default BrandProductsPage;