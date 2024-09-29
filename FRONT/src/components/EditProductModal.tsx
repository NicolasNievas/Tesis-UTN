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
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Price</label>
          <input
            type="text"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Stock</label>
          <input
            type="text"
            value={productStock}
            onChange={(e) => setProductStock(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image URLs (comma separated)</label>
          <input
            type="text"
            value={productImageURL}
            onChange={(e) => setProductImageURL(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Brand</label>
          <select
            value={selectedBrand?.toString() || ""}
            onChange={handleBrandChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <select
            value={selectedCategory?.toString() || ""}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!selectedBrand}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;