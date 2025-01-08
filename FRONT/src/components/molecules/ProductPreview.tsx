/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useRouter } from 'next/navigation';
import { IProductData } from '@/interfaces/data.interfaces';

interface ProductPreviewProps {
  product: IProductData;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      className="w-full rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
      onClick={handleRedirect}
    >
      {/* Product image */}
      <div className="relative h-80 flex justify-center">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className="absolute h-full object-contain"
        />
      </div>

      {/* Product information */}
      <div className="px-4 py-2 flex justify-between items-center bg-white">
        <p className="font-bold text-xs truncate">{product.name}</p>
        <p className="text-gray-800 text-sm">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductPreview;