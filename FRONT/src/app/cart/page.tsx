/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from 'react';
import { useAuthContext } from '@/context/data.context';
import Button from "@/components/atoms/Button";
import Line from "@/components/atoms/Line";
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { toast } from 'react-toastify';
import { ShoppingCart, Trash2, ChevronRight, Package, Truck, Shield, ArrowLeft } from 'lucide-react';

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
      toast.success('Product removed from cart');
    } catch (error) {
      toast.error('Error removing product from cart');
      console.error(error);
    }
  };

  const handleQuantityChange = async (productId: number, quantity: number) => {
    await updateCartItem(productId, quantity);
  };

  const calculateSubtotal = () => {
    return cart?.items?.reduce((subtotal, item) => subtotal + item.subtotal, 0) || 0;
  };

  const handleGoToCheckout = () => {
    if (cart?.items && cart.items.length > 0) {
      router.push('/checkout');
    } else {
      toast.warning('Your cart is empty');
    }
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      {/* Header */}
      <div className="mb-8">

        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black-btn rounded-lg">
            <ShoppingCart className="w-6 h-6 text-gray-bg-light" />
          </div>
          <h1 className="text-3xl font-bold text-black">Your Cart</h1>
          {cart?.items && cart.items.length > 0 && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-gray-600">Review your items and proceed to checkout</p>
      </div>

      {!cart?.items?.length ? (
        // Empty Cart State
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any products to your cart yet.</p>
            <Button
              name="Start Shopping"
              onClick={handleContinueShopping}
              className="px-8 py-3 text-lg bg-black-btn hover:bg-black-hover text-gray-bg-light"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Cart Items Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 bg-gray-50 rounded-t-xl p-4 border-b border-gray-200">
              <div className="col-span-5">
                <span className="font-medium text-gray-700">Product</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium text-gray-700">Price</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium text-gray-700">Quantity</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium text-gray-700">Total</span>
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {cart.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Product Info */}
                  <div className="lg:col-span-5 flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={item.imageUrls[0]} 
                        alt={item.productName} 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      {item.availableStock < 5 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Low
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.productName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package className="w-3 h-3" />
                        <span>Available: {item.availableStock} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="lg:col-span-2 flex lg:justify-center items-center">
                    <div className="text-left lg:text-center">
                      <p className="text-lg font-semibold text-gray-900">${item.price}</p>
                      {item.availableStock < 5 && (
                        <p className="text-xs text-yellow-600">Low stock</p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="lg:col-span-2 flex lg:justify-center items-center">
                    <div className="relative w-24">
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-base font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-btn focus:border-transparent appearance-none cursor-pointer"
                      >
                        {[...Array(Math.min(item.availableStock, 20))].map((_, index) => (
                          <option key={index + 1} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="lg:col-span-2 flex lg:justify-center items-center">
                    <div className="text-left lg:text-center">
                      <p className="text-xl font-bold text-gray-900">${item.subtotal}</p>
                      <p className="text-sm text-gray-500">
                        ${item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="lg:col-span-1 flex lg:justify-end items-center">
                    <button 
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <button
                onClick={handleContinueShopping}
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-lg font-semibold text-gray-900">${calculateSubtotal()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium text-gray-900">{cart.items.length}</span>
                </div>

                <Line />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-black">${calculateSubtotal()}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">
                  Shipping and taxes will be calculated at checkout
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Button 
                  name='Proceed to Checkout'
                  onClick={handleGoToCheckout} 
                  className='w-full py-4 text-lg font-semibold bg-black-btn hover:bg-black-hover text-gray-bg-light shadow-lg hover:shadow-xl transition-all'
                />
                <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;