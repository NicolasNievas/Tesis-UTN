/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { IProductData, IBrandData, ICategoryData } from '@/interfaces/data.interfaces';
import Button from '@/components/atoms/Button';
import { toast } from 'react-toastify';
import { useAuthContext } from '@/context/data.context';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Tag, 
  Award,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProductDetailProps {
  product: IProductData;
  brand: IBrandData;
  category: ICategoryData;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, brand, category }) => {
  const { imageUrls } = product;
  const { addToCart, cartLoading, isAuthenticated, cart } = useAuthContext();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const checkProductInCart = (productId: number) => {
    return cart?.items?.some(item => item.productId === productId) ?? false;
  };

  const hasStock = product.stock > 0;
  const isInCart = checkProductInCart(product.id);
  const stockStatus = product.stock === 0 ? 'out-of-stock' : 
                     product.stock < 10 ? 'low-stock' : 'in-stock';

  const stockColors = {
    'out-of-stock': 'text-red-600 bg-red-50 border-red-200',
    'low-stock': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'in-stock': 'text-green-600 bg-green-50 border-green-200'
  };

  const getButtonText = () => {
    if (cartLoading) return "Adding to cart...";
    if (!hasStock) return "Out of stock";
    if (isInCart) return "Added to cart ✓";
    return "Add to cart";
  };
  
  const isButtonDisabled = cartLoading || isInCart || !hasStock;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/account');
      return;
    }

    if (!hasStock) {
      toast.warning('This product is out of stock');
      return;
    }

    try {
      await addToCart(product.id);
      toast.success('Product added to cart');
    } catch (error) {
      console.log(error);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb simple */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Sección de imágenes ampliada */}
        <div className="space-y-4">
          {/* Imagen principal más grande */}
          <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200">
            <div className="relative h-[550px] flex items-center justify-center">
              <img 
                src={imageUrls[selectedImageIndex]} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain p-4"
              />
              
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas - Solo si hay más de una imagen */}
            {imageUrls.length > 1 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index 
                          ? 'border-black-btn ring-2 ring-black-btn ring-opacity-20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`${product.name} ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del producto - Más limpia */}
        <div className="space-y-6">
          {/* Header del producto */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {brand.name}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {category.name}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-3">{product.name}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
          </div>

          {/* Precio y stock */}
          <div className="py-4 border-y border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl lg:text-4xl font-bold text-black">${product.price}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${stockColors[stockStatus]}`}>
                {stockStatus === 'in-stock' ? 'In Stock' : 
                 stockStatus === 'low-stock' ? `Low Stock (${product.stock})` : 'Out of Stock'}
              </div>
            </div>
          </div>

          {/* Información técnica simple */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Package className="w-5 h-5" />
                <span className="font-medium">Available Units</span>
              </div>
              <span className={`font-medium ${stockStatus === 'in-stock' ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock} units
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Tag className="w-5 h-5" />
                <span className="font-medium">Brand</span>
              </div>
              <span className="text-gray-800 font-medium">{brand.name}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Award className="w-5 h-5" />
                <span className="font-medium">Category</span>
              </div>
              <span className="text-gray-800 font-medium">{category.name}</span>
            </div>
          </div>

          {/* Solo el botón Add to Cart */}
          <div className="pt-4">
            <Button
              className={`w-full py-4 text-lg font-semibold ${
                isInCart 
                  ? 'bg-gray-400 hover:bg-gray-400' 
                  : 'bg-black-btn hover:bg-black-hover'
              } text-gray-bg-light shadow-lg hover:shadow-xl transition-all`}
              name={getButtonText()}
              onClick={handleAddToCart}
              isDisabled={isButtonDisabled}
              isLoading={cartLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;