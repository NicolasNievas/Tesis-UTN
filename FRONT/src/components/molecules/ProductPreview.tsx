/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useRouter } from 'next/navigation';
import { IProductData } from '@/interfaces/data.interfaces';

interface ProductPreviewProps {
  product: IProductData;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const router = useRouter();
  const hasStock = product.stock > 0;

  const handleRedirect = () => {
    if (!hasStock) return; // No redirigir si no hay stock
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      className={`
        w-full rounded-lg overflow-hidden shadow-md bg-white 
        transform transition-transform duration-300 relative
        ${hasStock 
          ? 'cursor-pointer hover:scale-105 hover:shadow-lg' 
          : 'cursor-not-allowed opacity-80'
        }
      `}
      onClick={handleRedirect}
    >
      {/* Overlay de "Sin stock" */}
      {!hasStock && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex items-center justify-center">
          <div className="bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm rotate-[-15deg]">
            OUT OF STOCK
          </div>
        </div>
      )}

      {/* Indicador de stock en la esquina */}
      <div className={`absolute top-2 right-2 z-20 px-2 py-1 rounded-full text-xs font-bold ${
        hasStock 
          ? product.stock < 10 
            ? 'bg-yellow-500 text-white' 
            : 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}>
        {hasStock ? (product.stock < 10 ? `LOW: ${product.stock}` : 'IN STOCK') : 'NO STOCK'}
      </div>

      {/* Product image */}
      <div className="relative h-80 flex justify-center">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className="absolute h-full object-contain"
        />
      </div>

      {/* Product information */}
      <div className={`px-4 py-2 flex justify-between items-center ${
        hasStock ? 'bg-white' : 'bg-gray-100'
      }`}>
        <p className={`font-bold text-xs truncate ${!hasStock ? 'text-gray-500' : ''}`}>
          {product.name}
        </p>
        <p className={`text-sm ${!hasStock ? 'text-gray-400' : 'text-gray-800'}`}>
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default ProductPreview;