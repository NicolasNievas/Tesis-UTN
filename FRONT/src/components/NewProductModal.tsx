import React, { useState, useEffect } from 'react';
import { IProductData, IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { getAllActiveBrands, fetchCategoriesByBrand } from "@/services/brandService";
import { toast } from 'react-toastify';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<IProductData>) => void;
}

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImageURL, setProductImageURL] = useState('');
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const activeBrands = await getAllActiveBrands();
        if (activeBrands.length === 0) {
          setError("No hay marcas activas disponibles");
        } else {
          setBrands(activeBrands);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching active brands:", error);
        setError("Error al cargar las marcas activas");
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedBrand !== null) {
        try {
          const activeCategories = await fetchCategoriesByBrand(selectedBrand);
          if (activeCategories.length === 0) {
            setError("No categories available for this brand.");
            setCategories([]);
          } else {
            setCategories(activeCategories);
            setError(null);
          }
        } catch (error) {
          console.error("Error fetching categories by brand:", error);
          toast.error("Error loading categories for this brand.");
          setCategories([]);
        }
      } else {
        setCategories([]);
        setError(null);
      }
      setSelectedCategory(null);
    };

    fetchCategories();
  }, [selectedBrand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();    
    
    if (selectedBrand === null) {
      toast.error("Por favor, seleccione una marca");
      return;
    }

    if (categories.length > 0 && selectedCategory === null) {
      setError("Por favor, seleccione una categoría");
      return;
    }

    if (categories.length === 0) {
      toast.error("Favor de seleccionar una categoría");
      return;
    }

    if(selectedBrand && selectedCategory ){
       const selectedCategoryData = categories.find(categories => categories.id === selectedCategory);
       if(!selectedCategoryData || selectedCategoryData.brandId !== selectedBrand){
         toast.error("La categoría seleccionada no pertenece a la marca seleccionada.");
         return;
       }
     }

    onSubmit({
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      stock: parseInt(productStock, 10),
      imageUrls: productImageURL.split(',').map((url) => url.trim()),
      brandId: selectedBrand!,
      categoryId: selectedCategory!,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductImageURL('');
    setSelectedBrand(null);
    setSelectedCategory(null);
    setCategories([]);
    setError(null);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = Number(e.target.value);
    setSelectedBrand(brandId || null);
    setSelectedCategory(null);
    setCategories([]);
    setError(null);
  };

  const isCategorySelectDisabled = !selectedBrand || categories.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="productName" className="block mb-2">Nombre</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="productDescription" className="block mb-2">Descripción</label>
            <textarea
              id="productDescription"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="brand" className="block mb-2">Marca</label>
            <select
              id="brand"
              value={selectedBrand ?? ''}
              onChange={handleBrandChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block mb-2">Categoría</label>
            <select
              id="category"
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              className="w-full p-2 border rounded"
              required
              disabled={!selectedBrand || categories.length === 0}
            >
              <option value="" disabled>
                {!selectedBrand 
                  ? "Select a Category" 
                  : categories.length === 0 
                    ? "No categories available" 
                    : "Select a Category"
                }
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="productPrice" className="block mb-2">Precio</label>
            <input
              type="number"
              id="productPrice"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="w-full p-2 border rounded"
              required
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="productStock" className="block mb-2">Stock</label>
            <input
              type="number"
              id="productStock"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="productImageURL" className="block mb-2">Imagen URL</label>
            <input
              type="text"
              id="productImageURL"
              value={productImageURL}
              onChange={(e) => setProductImageURL(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Separar múltiples URLs con comas"
              required
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="button" onClick={() => {resetForm(); onClose(); }} className="mr-2 px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;