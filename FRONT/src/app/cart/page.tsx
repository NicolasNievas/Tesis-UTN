"use client";

import React, { useEffect } from 'react';
import { useAuthContext } from '@/context/data.context';
import Link from 'next/link';
import Button from "@/components/atoms/Button";
import Line from "@/components/atoms/Line";
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { toast } from 'react-toastify';

const SHIPPING_COST = 0;

const CartPage: React.FC = () => {
  const { cart, getCart, isAuthenticated, cartLoading, updateCartItem, removeFromCart } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account');
      toast.error('You must be logged in to view your cart.');
      return;
    }
    
    if (isAuthenticated && !cart) {
      getCart();
    }
  }, [isAuthenticated, getCart, router, cart]);

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast.error('Error removing product from cart');
    }
  };


  const handleQuantityChange = async (productId: number, quantity: number) => {
    await updateCartItem(productId, quantity);
  };

  const calculateSubtotal = () => {
    return cart?.items?.reduce((subtotal, item) => subtotal + item.subtotal, 0) || 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + SHIPPING_COST;
  };

  if (cartLoading) {
    return <p> <LoadingSpinner /> </p>;
  }

  return (
    <div className="container mx-auto h-screen py-8">
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>
      {!cart?.items?.length ? (
        <p>You don't have anything in your cart.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-2 ps-4 pe-4 m-2 shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md">
            <div className="cartHeader grid grid-cols-5 items-center">
              <div className="text-lg">Item</div>
              <div className="text-lg">Quantity</div>
              <div className="text-lg">Price</div>
              <div className="text-lg">Subtotal</div>
              <div className="text-lg">Actions</div>
            </div>
            <Line />
            {cart.items.map((item) => (
              <div className="productContainer grid grid-cols-5 border-b border-gray-300 py-4 items-center" key={item.id}>
                <div className="flex items-center">
                  <img src={item.imageUrls[0]} alt={item.productName} className="productImage mr-4" style={{ width: "4rem", height: "4rem" }} />
                  <div className="productDetails p-2">
                    <h3 className="text-sm font-semibold">{item.productName}</h3>
                  </div>
                </div>
                <div>
                  <div className="w-20">
                    <select
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                    className="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      {[...Array(item.availableStock)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-1/5">
                  <p className="text-lg">${item.price}</p>
                </div>
                <div className="w-1/5">
                  <p className="text-xl font-semibold text-right">${item.subtotal}</p>
                </div>
                <div className="items-center">
                  <button onClick={() => handleRemoveItem(item.productId)} className="bg-gray-200 p-2 rounded-md hover:bg-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-bg p-2 rounded-lg m-2 shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md">
              <p className="text-xl font-semibold pb-4">Summary</p>
              <Line />
              <p className="text-lg">Subtotal <span className="float-right">${calculateSubtotal()}</span></p>
              <p className="text-lg">Shipping <span className="float-right">${SHIPPING_COST}</span></p>
              <Line />
              <p className="text-lg">Total <span className="float-right">${calculateTotal()}</span></p>
              <Line />
              <Link href="checkout">
                <Button name="Go to Checkout" className='w-full h-[90px] p-2 h-auto text-xl bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light'/>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;