import React, { useState, useEffect } from 'react';
import { IProductData, ICategoryData, IBrandData } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import { fetchCategoriesByBrand } from '@/services/brandService';
import { X, Loader2 } from 'lucide-react';

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
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setLoadingCategories(true);
          const data = await fetchCategoriesByBrand(selectedBrand);
          setCategories(data);
        } catch (err) {
          console.log(err);
          toast.error("Error loading categories.");
        } finally {
          setLoadingCategories(false);
        }
      } else {
        setCategories([]);
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [selectedBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedBrand && selectedCategory) {
      const selectedCategoryData = categories.find(category => category.id === selectedCategory);
      if (!selectedCategoryData || selectedCategoryData.brandId !== selectedBrand) {
        toast.error("The selected category does not belong to the selected brand.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit({
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
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = Number(e.target.value);
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <p className="text-sm text-gray-500 mt-1">{product.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm min-h-[80px] resize-y"
                placeholder="Enter product description"
                required
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <div className="relative">
                <select
                  id="brand"
                  value={selectedBrand ?? ''}
                  onChange={handleBrandChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors text-sm"
                  required
                >
                  <option value="" disabled>Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory ?? ''}
                  onChange={(e) => setSelectedCategory(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors text-sm"
                  required
                  disabled={!selectedBrand || loadingCategories || categories.length === 0}
                >
                  <option value="" disabled>
                    {!selectedBrand 
                      ? "Select a brand first" 
                      : loadingCategories 
                        ? "Loading..." 
                        : categories.length === 0 
                          ? "No categories" 
                          : "Select a category"
                    }
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                Price *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="productPrice"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  placeholder="0.00"
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label htmlFor="productStock" className="block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                type="number"
                id="productStock"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                placeholder="Quantity"
                required
                min="0"
              />
            </div>

            {/* Image URLs */}
            <div className="col-span-2 space-y-2">
              <label htmlFor="productImageURL" className="block text-sm font-medium text-gray-700">
                Image URLs *
              </label>
              <input
                type="text"
                id="productImageURL"
                value={productImageURL}
                onChange={(e) => setProductImageURL(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple URLs with commas</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;