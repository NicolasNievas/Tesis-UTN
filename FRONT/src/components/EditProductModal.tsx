import React, { useState, useEffect } from 'react';
import { IProductData, ICategoryData, IBrandData } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import { fetchCategoriesByBrand } from '@/services/brandService';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedProduct: Partial<IProductData>) => void;
  product: IProductData | null;
  brands: IBrandData[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSubmit, product, brands }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImageURL, setProductImageURL] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<ICategoryData[]>([]);

  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setProductDescription(product.description);
      setProductPrice(product.price.toString());
      setProductStock(product.stock.toString());
      setProductImageURL(product.imageUrls.join(', '));
      setSelectedBrand(product.brandId);
      setSelectedCategory(product.categoryId);
    }
  }, [product]);

  useEffect(() => {
    const loadCategories = async () => {
      if (selectedBrand) {
        try {
          const data = await fetchCategoriesByBrand(selectedBrand);
          setCategories(data);
        } catch (err) {
          toast.error("Error al cargar las categorías. Por favor, intente de nuevo más tarde.");
        }
      } else {
        setCategories([]);
      }
    };

    loadCategories();
  }, [selectedBrand]);

  const handleSubmit = () => {
    if (selectedBrand && selectedCategory) {
      const selectedCategoryData = categories.find(category => category.id === selectedCategory);
      if (!selectedCategoryData || selectedCategoryData.brandId !== selectedBrand) {
        toast.error("La categoría seleccionada no pertenece a la marca seleccionada.");
        return;
      }
    }

    onSubmit({
      id: product?.id,
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

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = Number(event.target.value);
    setSelectedBrand(brandId || null);
    setSelectedCategory(null);
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductImageURL('');
    setSelectedBrand(null);
    setSelectedCategory(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-2xl mb-4">Edit Product</h2>
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
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;