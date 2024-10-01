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
      <div className="px-4 py-3 flex justify-between">
        <div className="font-bold text-lg mb-1 truncate">{product.name}</div>
        <p className="text-gray-800 text-base">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductPreview;