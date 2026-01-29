/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Wallet } from '@mercadopago/sdk-react';
import CheckoutService from '@/services/CheckoutService';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Button from '@/components/atoms/Button';
import Line from '@/components/atoms/Line';
import { useAuthContext } from '@/context/data.context';
import { CheckoutData, ShippingMethod } from '@/interfaces/data.interfaces';
import MercadoPagoService from '@/services/MercadoPagoService';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account');
      toast.error('You must be logged in to proceed to checkout.');
      return;
    }

    loadCheckoutData();
  }, [isAuthenticated, router]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const data = await CheckoutService.getCheckoutInfo();
      console.log('Checkout data loaded:', data); // Para debug
      setCheckoutData(data);
      
      // Establecer valores iniciales del formulario
      if (data.shippingAddress) {
        setAddress(data.shippingAddress.address || '');
        setCity(data.shippingAddress.city || '');
        setPostalCode(data.shippingAddress.postalCode || '');
      }
      
      // Establecer método de envío seleccionado
      if (data.cart.selectedShippingId) {
        setSelectedShipping(data.cart.selectedShippingId);
      }
      
    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Error loading checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingMethodChange = async (shippingId: number) => {
  setSelectedShipping(shippingId);
  
  try {
    setIsUpdatingShipping(true);
    // const updatedCart = await CheckoutService.updateShippingInfo({
    //   shippingMethodId: shippingId,
    //   address,
    //   city,
    //   postalCode
    // });
    
    // Volver a cargar los datos completos de checkout
    await loadCheckoutData();
    
    toast.success('Shipping method updated');
  } catch (error) {
    console.error('Error updating shipping method:', error);
    toast.error('Error updating shipping method');
  } finally {
    setIsUpdatingShipping(false);
  }
};

  const handleAddressUpdate = async () => {
    if (!address || !city) {
        toast.error('Please complete the address and city fields');
        return;
    }

        try {
            setIsUpdatingShipping(true);
            await CheckoutService.updateShippingInfo({
            shippingMethodId: selectedShipping || undefined,
            address,
            city,
            postalCode
            });
            
            // Volver a cargar los datos completos
            await loadCheckoutData();
            
            toast.success('Address updated successfully');
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Error updating address');
        } finally {
            setIsUpdatingShipping(false);
        }
    };

  const handleGeneratePayment = async () => {
    if (!selectedShipping) {
      toast.error('Please select a shipping method');
      return;
    }

    if (!address || !city) {
      toast.error('Please complete the shipping address');
      return;
    }

    const selectedMethod = checkoutData?.availableShippingMethods.find(
      m => m.id === selectedShipping
    );

    if (selectedMethod?.requiresPostalCode && !postalCode) {
      toast.error('Postal code is required for this shipping method');
      return;
    }

    try {
      setLoading(true);
      const { preferenceId: newPreferenceId } = await MercadoPagoService.initiatePayment();
      setPreferenceId(newPreferenceId);
      toast.success('Payment preference generated');
    } catch (error) {
      console.error('Error generating payment:', error);
      toast.error('Error generating payment');
    } finally {
      setLoading(false);
    }
  };

   if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

 if (!checkoutData) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">No checkout data available. Please try again.</p>
        <Button 
          name="Reload"
          onClick={loadCheckoutData}
          className="mt-4 mx-auto"
        />
      </div>
    );
  }

  const selectedMethod = checkoutData?.availableShippingMethods?.find(
    m => m.id === selectedShipping
  ) || null;

  // También verifica que los métodos de envío estén disponibles
  const availableShippingMethods = checkoutData?.availableShippingMethods || [];

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      
      {!checkoutData?.cart?.items?.length ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sección de envío y dirección */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de envío */}
            <div className="p-6 shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md bg-white">
              <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Street and number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code {!selectedMethod?.requiresPostalCode && '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Postal code"
                    />
                  </div>
                </div>
                <Button
                  name={isUpdatingShipping ? 'Updating...' : 'Update Address'}
                  onClick={handleAddressUpdate}
                  isDisabled={isUpdatingShipping}
                  className="w-full p-2 bg-black-btn hover:bg-black-hover text-white rounded-md"
                />
              </div>
            </div>

            {/* Métodos de envío */}
            <div className="p-6 shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-md bg-white">
              <h3 className="text-xl font-semibold mb-4">Shipping Method</h3>
              <div className="space-y-3">
                {availableShippingMethods.map((method: ShippingMethod) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-md cursor-pointer transition-all ${
                      selectedShipping === method.id
                        ? 'border-blue bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleShippingMethodChange(method.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={selectedShipping === method.id}
                            onChange={() => handleShippingMethodChange(method.id)}
                            className="w-4 h-4"
                          />
                          <h4 className="font-semibold">{method.displayName}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        {method.estimatedDays > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Estimated delivery: {method.estimatedDays} business days
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {method.baseCost === 0 ? 'Free' : `$${method.baseCost}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gray-bg p-6 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <Line />
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutData.cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.imageUrls[0]}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity} × ${item.price}
                      </p>
                      <p className="text-sm font-semibold">${item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Line />
              
              {/* Totales */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${checkoutData.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${checkoutData.shippingCost}</span>
                </div>
                <Line />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${checkoutData.total}</span>
                </div>
              </div>

              <Line />

              {!preferenceId ? (
                <Button
                  name={loading ? 'Processing...' : 'Generate Payment'}
                  onClick={handleGeneratePayment}
                  isDisabled={loading || !selectedShipping || !address || !city}
                  className="w-full p-3 bg-black-btn hover:bg-black-hover text-white rounded-md"
                />
              ) : (
                <div id="wallet_container">
                  <Wallet
                    initialization={{ preferenceId }}
                    customization={{ texts: { valueProp: 'smart_option' } }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;