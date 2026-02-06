/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Wallet } from '@mercadopago/sdk-react';
import CheckoutService from '@/services/CheckoutService';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Button from '@/components/atoms/Button';
import { useAuthContext } from '@/context/data.context';
import { CheckoutData, ShippingMethod } from '@/interfaces/data.interfaces';
import MercadoPagoService from '@/services/MercadoPagoService';
import { 
  Truck, 
  MapPin, 
  Package, 
  CreditCard, 
  CheckCircle,
  ChevronRight,
  Home,
  Clock,
  Shield
} from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      console.log('Checkout data loaded:', data);
      setCheckoutData(data);
      
      if (data.shippingAddress) {
        setAddress(data.shippingAddress.address || '');
        setCity(data.shippingAddress.city || '');
        setPostalCode(data.shippingAddress.postalCode || '');
      }
      
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

      await CheckoutService.updateShippingInfo({
        shippingMethodId: shippingId,
        address,
        city,
        postalCode
      })

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
      <div className="flex justify-center items-center min-h-screen">
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

  const availableShippingMethods = checkoutData?.availableShippingMethods || [];

  return (
    <div className="mx-auto px-4 py-8 min-h-screen max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Checkout</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">{checkoutData.cart.items.length} items</span>
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            <span className="text-sm">Shipping</span>
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Payment</span>
          </div>
        </div>
      </div>

      {!checkoutData?.cart?.items?.length ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Add items to your cart before proceeding to checkout.</p>
            <Button
              name="Continue Shopping"
              onClick={() => router.push('/')}
              className="px-8 py-3 text-lg bg-black-btn hover:bg-black-hover text-gray-bg-light"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card - HEADER MÁS COMPACTO */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100"> {/* Reducido de p-6 a p-4 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg"> {/* Reducido de p-2 a p-1.5 */}
                      <MapPin className="w-4 h-4 text-blue-600" /> {/* Reducido de w-5 h-5 a w-4 h-4 */}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3> {/* Reducido de text-xl a text-lg */}
                      <p className="text-xs text-gray-600">Where should we deliver your order?</p> {/* Reducido de text-sm a text-xs */}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6"> {/* Mantiene el padding original para el contenido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-btn focus:border-transparent"
                        placeholder="Street and number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-btn focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                </div>
                
                <div className="mt-4 w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code {!selectedMethod?.requiresPostalCode && <span className="text-gray-500">(Optional)</span>}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-btn focus:border-transparent"
                    placeholder="Postal code"
                  />
                </div>
                
                <div className="mt-6">
                  <Button
                    name={isUpdatingShipping ? 'Updating...' : 'Update Address'}
                    onClick={handleAddressUpdate}
                    isDisabled={isUpdatingShipping}
                    className="w-full md:w-auto px-6 py-3 bg-black-btn hover:bg-black-hover text-gray-bg-light shadow-lg hover:shadow-xl transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Methods Card - HEADER MÁS COMPACTO */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100"> {/* Reducido de p-6 a p-4 */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-lg"> {/* Reducido de p-2 a p-1.5 */}
                    <Truck className="w-4 h-4 text-green-600" /> {/* Reducido de w-5 h-5 a w-4 h-4 */}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Shipping Method</h3> {/* Reducido de text-xl a text-lg */}
                    <p className="text-xs text-gray-600">Choose how you want to receive your order</p> {/* Reducido de text-sm a text-xs */}
                  </div>
                </div>
              </div>
              
              <div className="p-6"> {/* Mantiene el padding original para el contenido */}
                
                <div className="space-y-4">
                  {availableShippingMethods.map((method: ShippingMethod) => (
                    <div
                      key={method.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedShipping === method.id
                          ? 'border-black-btn bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleShippingMethodChange(method.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedShipping === method.id 
                                ? 'border-black-btn bg-black-btn' 
                                : 'border-gray-300'
                            }`}>
                              {selectedShipping === method.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{method.displayName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600">
                                  {method.estimatedDays > 0 
                                    ? `Estimated delivery: ${method.estimatedDays} business days`
                                    : 'Same day delivery'
                                  }
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">{method.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {method.baseCost === 0 ? 'FREE' : `$${method.baseCost}`}
                          </p>
                          {method.baseCost > 0 && (
                            <p className="text-sm text-gray-500">Shipping cost</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (SIN CAMBIOS) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </h3>

              {/* Items List with Toggle */}
              <div className="mb-6">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center justify-between w-full mb-3 text-gray-700 hover:text-black"
                >
                  <span className="font-medium">{checkoutData.cart.items.length} items</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
                </button>
                
                {!isCollapsed && (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {checkoutData.cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <img
                          src={item.imageUrls[0]}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-600">
                              {item.quantity} × ${item.price}
                            </p>
                            <p className="font-semibold text-gray-900">${item.subtotal}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">${checkoutData.subtotal}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-semibold ${checkoutData.shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {checkoutData.shippingCost === 0 ? 'FREE' : `$${checkoutData.shippingCost}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-black">${checkoutData.total}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {checkoutData.shippingCost === 0 
                      ? 'Free shipping applied' 
                      : 'Shipping included'
                    }
                  </p>
                </div>
              </div>

              {/* Payment Button */}
              <div className="mt-8">
                {!preferenceId ? (
                  <button
                    onClick={handleGeneratePayment}
                    disabled={loading || !selectedShipping || !address || !city}
                    className={`w-full py-4 text-lg font-semibold rounded-lg flex items-center justify-center gap-2 ${
                      !selectedShipping || !address || !city
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-black-btn hover:bg-black-hover'
                    } text-gray-bg-light shadow-lg hover:shadow-xl transition-all`}
                  >
                    {!loading && <CreditCard className="w-5 h-5" />}
                    <span>{loading ? 'Processing...' : 'Proceed to Payment'}</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Payment ready</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Complete your payment below
                      </p>
                    </div>
                    <div id="wallet_container" className="mt-4">
                      <Wallet
                        initialization={{ preferenceId }}
                        customization={{ 
                          texts: { 
                            valueProp: 'smart_option',
                            action: 'pay'
                          },
                          visual: {
                            buttonBackground: 'black',
                            borderRadius: '0.75rem'
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Tracked delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;