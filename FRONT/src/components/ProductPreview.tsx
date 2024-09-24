import React from 'react';
import { IProductData } from '@/interfaces/data.interfaces';

interface ProductPreviewProps {
  product: IProductData;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product }) => {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md bg-white">
      {/* Product image */}
      <div className="relative h-80">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className="absolute w-full h-full object-cover"
        />
      </div>

      {/* Product information */}
      <div className="px-4 py-3">
        <div className="font-bold text-lg mb-1 truncate">{product.name}</div>
        <p className="text-gray-800 text-base">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductPreview;