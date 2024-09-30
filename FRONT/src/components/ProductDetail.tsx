import React from 'react';
import Image from 'next/image';
import { IProductData, IBrandData, ICategoryData } from '@/interfaces/data.interfaces';
import Button from '@/components/Button';
import { toast } from 'react-toastify';

interface ProductDetailProps {
  product: IProductData;
  brand: IBrandData;
  category: ICategoryData;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, brand, category }) => {
  const { imageUrls } = product;
  // const { cart, addToCart, user } = useDataContext();

  // const checkUser = () => {
  //   if (!user) {
  //     route("/account");
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  const handleAddToCart = () => {
    // if (checkUser()) {
    //   const isProductInCart = cart.some((item) => item.id === product.id);

    //   if (isProductInCart) {
    //     toast.warning(`${product.name} is already added`);
    //   } else {
    //     addToCart(product);
    //     toast.success(`${product.name} successfully added`);
    //   }
    // }
    toast.info("Add to cart functionality is not implemented yet.");
  };

  return (
    <div className="container mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center items-center">
          <img src={imageUrls[0]} alt={product.name} className="rounded-lg" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-xl font-semibold mb-4">Price: ${product.price}</p>
            <p className="text-lg mb-2">Stock: {product.stock}</p>
            <p className="text-lg mb-2">Brand: {brand.name}</p>
            <p className="text-lg mb-2">Category: {category.name}</p>
          </div>
          <Button
            className="mb-0 mt-8 bg-black-btn hover:bg-black-hover hover:text-white text-xl font-medium text-gray-bg-light"
            name="Add to cart"
            onClick={handleAddToCart}
          />
        </div>
      </div>
      <hr className="my-8 border-gray-300" />
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-center">More Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageUrls.slice(1).map((url, index) => (
            <img key={index} src={url} alt={product.name} className="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;