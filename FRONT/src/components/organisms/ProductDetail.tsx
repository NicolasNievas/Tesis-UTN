import React from 'react';
import Image from 'next/image';
import { IProductData, IBrandData, ICategoryData } from '@/interfaces/data.interfaces';
import Button from '@/components/atoms/Button';
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
        {/* Imagen principal */}
        <div className="flex justify-center items-center">
          <img src={imageUrls[0]} alt={product.name} className="rounded-lg max-h-[600px]  object-contain" />
        </div>
        {/* Información del producto */}
        <div className="flex flex-col justify-between h-full min-h-[500px]">
          <div className="flex-grow overflow-auto">
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="text-gray-700 mb-4">{product.description}</p>
            {/* Información adicional */}
            <div className="product-info space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h3 className="text-lg font-bold">Stock:</h3>
                <span className="text-gray-500 font-normal">{product.stock}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h3 className="text-lg font-bold">Brand:</h3>
                <span className="text-gray-500 font-normal">{brand.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h3 className="text-lg font-bold">Category:</h3>
                <span className="text-gray-500 font-normal">{category.name}</span>
              </div>
            </div>
          </div>
          {/* Precio y botón de compra */}
          <div className="mt-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-2xl font-semibold">Price:</h3>
              <span className="text-gray-500 text-xl font-normal">${product.price}</span>
            </div>
            <Button
              className="w-full h-2/3 mt-4 bg-black-btn hover:bg-black-hover hover:text-white text-xl font-medium text-gray-bg-light"
              name="Add to cart"
              onClick={handleAddToCart}
            />
          </div>
        </div>
      </div>
      <hr className="my-8 border-gray-300" />
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-center">More Images</h3>
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-4">
            {imageUrls.slice(0).map((url, index) => (
              <div key={index} className="w-[250px] h-[250px] flex justify-center items-center border border-gray-200 rounded-lg overflow-hidden" >
                <img src={url} alt={product.name} className="w-auto h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;