/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  User, 
  Download,
  Package,
  MapPin,
  Truck,
  Clock,
  FileText,
  Home,
  Mail,
  IdCard,
  Store,
  Navigation,
  MapPinIcon
} from 'lucide-react';
import Link from "next/link";

interface IPaymentDetailsContentProps {
    paymentDetails: {
      metadata?: {
        shipping_method_name?: string;
        shipping_display_name?: string;
        shipping_estimated_days?: number;
        shipping_description?: string;
        shipping_address?: string;
        shipping_city?: string;
        shipping_postal_code?: string;
        shipping_cost?: string;
        user_nro_doc?: string;
        user_type_doc?: string;
        user_email?: string;
        user_first_name?: string;
        user_last_name?: string;
        [key: string]: any;
      };
      additional_info: {
        items: {
          picture_url: string;
          title: string;
          quantity: number;
          unit_price: number;
        }[];
      };
      payer: {
        identification?: {
          type: string;
          number: string;
        };
      };
      payment_type_id: string;
      date_created: string;
      transaction_amount: number;
    };
    status: string;
    statusInfo: {
        bgColor: string;
        icon: React.ReactNode;
        title: string;
        message: string;
        textColor: string;
    };
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    generatePDF: () => void;
    email: string;
    first_name: string;
    last_name: string;
    router: {
        push: (path: string) => void;
    };
}

export const PaymentDetailsContent: React.FC<IPaymentDetailsContentProps> = ({ 
  paymentDetails, 
  status, 
  statusInfo,
  formatDate, 
  formatCurrency, 
  generatePDF, 
  router,
  email,
  first_name,
  last_name
}) => {

  // Obtener informacion d envio
  const shippingInfo = paymentDetails.metadata ? {
    method: paymentDetails.metadata.shipping_method_name?.toLowerCase() || 'standard',
    display_name: paymentDetails.metadata.shipping_display_name || 
                  paymentDetails.metadata.shipping_method_name || 
                  'Envío estándar',
    cost: parseFloat(paymentDetails.metadata.shipping_cost || '0'),
    estimated_days: paymentDetails.metadata.shipping_estimated_days,
    address: paymentDetails.metadata.shipping_address || '',
    city: paymentDetails.metadata.shipping_city || '',
    postal_code: paymentDetails.metadata.shipping_postal_code || '',
    description: paymentDetails.metadata.shipping_description || '',
    isPickup: paymentDetails.metadata.shipping_method_name?.toLowerCase() === 'local_pickup' ||
              paymentDetails.metadata.shipping_display_name?.toLowerCase().includes('pickup')
  } : null;

  // Función para abrir en Google Maps
  const openInGoogleMaps = (address: string, city: string) => {
    const fullAddress = `${address}, ${city}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
  };

  // Actualiza la función formatShippingMethod para usar display_name:
  const formatShippingMethod = (method: string, displayName?: string) => {
    const methods: Record<string, { name: string; icon: React.ReactNode; color: string; estimatedDeliveryText: string | null;}> = {
      'oca': { 
        name: displayName || 'OCA', 
        icon: <Truck className="h-5 w-5" />,
        color: 'text-orange-600',
        estimatedDeliveryText: 'business days'
      },
      'correo_argentino': { 
        name: displayName || 'Argentine Mail', 
        icon: <Truck className="h-5 w-5" />,
        color: 'text-blue-600',
        estimatedDeliveryText: 'business days'
      },
      'andreani': { 
        name: displayName || 'Andreani', 
        icon: <Truck className="h-5 w-5" />,
        color: 'text-green-600',
        estimatedDeliveryText: 'business days'
      },
      'local_pickup': { 
        name: displayName || 'Store Pickup', 
        icon: <Home className="h-5 w-5" />,
        color: 'text-green-600',
        estimatedDeliveryText: 'Ready for pickup'
      }
    };
    
    return methods[method.toLowerCase()] || {
      name: displayName || method,
      icon: <Truck className="h-5 w-5" />,
      color: 'text-gray-600',
      estimatedDeliveryText: 'business days'
    };
  };

  // Luego en el JSX, usa:
  const shippingMethodInfo = shippingInfo ? 
    formatShippingMethod(shippingInfo.method, shippingInfo.display_name) : 
    null;

    const calculateProductsSubtotal = () => {
      return paymentDetails.additional_info.items.reduce(
        (sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 
        0
      );
    };

    const productsSubtotal = calculateProductsSubtotal();
    const shippingCost = shippingInfo?.cost || 0;
    const total = paymentDetails.transaction_amount;
    console.log('Renderizando PaymentDetailsContent');
    console.log('Status:', status);
    console.log('Status Info:', statusInfo);
    console.log('Payment Details tiene shipping?', shippingInfo);
    console.log('Email:', email);
    
    return (    
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Status Banner */}
          <div className={`text-center p-8 ${statusInfo.bgColor} rounded-3xl mb-10 shadow-lg border`}>
            <div className="mx-auto flex justify-center mb-6">
              <div className="relative p-4 bg-white rounded-full shadow-lg">
                {statusInfo.icon}
                {status === 'approved' && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-md">
                    ✓
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {statusInfo.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {statusInfo.message}
              {status === 'approved' && (
                <span className="block mt-3 text-base">
                  📧 We have sent a confirmation email to <span className="font-semibold text-gray-900">{email}</span>
                </span>
              )}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Products Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className={`p-3 ${status === 'approved' ? 'bg-green-100' : status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'} rounded-lg mr-4`}>
                      {statusInfo.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                      <p className="text-gray-500 mt-1">
                        Order placed on {formatDate(paymentDetails.date_created)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-5 py-2.5 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} font-semibold text-sm shadow-sm`}>
                    {status === 'approved' ? 'APPROVED' : 
                     status === 'pending' ? 'PENDING' : 'FAILED'}
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                      📦
                    </span>
                    Products ({paymentDetails.additional_info.items.length})
                  </h3>
                  {paymentDetails.additional_info.items.map((item, index) => (
                    <div key={index} className="flex items-center p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.picture_url || '/api/placeholder/80/80'} 
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-xl shadow-md"
                        />
                      </div>
                      <div className="ml-6 flex-grow">
                        <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: <span className="font-semibold text-gray-700">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(Number(item.unit_price) * Number(item.quantity))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(Number(item.unit_price))} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Section - Manteniendo estructura pero mejorando la tarjeta de dirección */}
                {shippingInfo && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                      <span className={`p-2 ${shippingInfo.isPickup ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-lg mr-3`}>
                        {shippingInfo.isPickup ? '🏪' : '🚚'}
                      </span>
                      {shippingInfo.isPickup ? 'Pickup Details' : 'Shipping Details'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Method Card - Sin cambios */}
                      <div className={`bg-gradient-to-br rounded-xl p-5 border ${shippingInfo.isPickup ? 'from-green-50 to-green-100 border-green-200' : 'from-blue-50 to-blue-100 border-blue-200'}`}>
                        <div className="flex items-center mb-4">
                          <div className={`p-3 ${shippingMethodInfo?.color} bg-white rounded-lg shadow-sm mr-3`}>
                            {shippingMethodInfo?.icon}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              {shippingInfo.isPickup ? 'Pickup Method' : 'Shipping Method'}
                            </p>
                            <p className="font-bold text-lg text-gray-900">
                              {shippingMethodInfo?.name}
                            </p>
                            {shippingInfo.description && (
                              <p className="text-sm text-gray-600 mt-1">{shippingInfo.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3">
                          {shippingInfo.isPickup ? (
                            <Calendar className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          )}
                          <div>
                            <p className="text-sm text-gray-500">
                              {shippingInfo.isPickup ? 'Availability' : 'Estimated Delivery'}
                            </p>
                            <p className="font-medium text-gray-900">
                              {shippingInfo.isPickup ? (
                                !shippingInfo.estimated_days || shippingInfo.estimated_days === 0 
                                  ? 'Ready for pickup today'
                                  : `Ready in ${shippingInfo.estimated_days} business days`
                              ) : (
                                !shippingInfo.estimated_days || shippingInfo.estimated_days > 0 
                                  ? `${shippingInfo.estimated_days || 3} ${shippingMethodInfo?.estimatedDeliveryText}`
                                  : 'Same day delivery'
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm text-gray-500">
                            {shippingInfo.isPickup ? 'Pickup Cost' : 'Shipping Cost'}
                          </p>
                          <p className={`font-bold text-xl ${shippingInfo.cost > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                            {shippingInfo.cost > 0 ? formatCurrency(shippingInfo.cost) : 'FREE'}
                          </p>
                        </div>
                      </div>

                      {/* Address Card - Versión mejorada y corregida */}
                      {(shippingInfo.isPickup || shippingInfo.address || shippingInfo.city) && (
                        <div className={`rounded-xl p-5 border shadow-sm overflow-hidden relative ${shippingInfo.isPickup ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'}`}>
                          
                          {/* Elemento decorativo sutil */}
                          <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 ${shippingInfo.isPickup ? 'text-green-500' : 'text-indigo-500'}`}>
                            {shippingInfo.isPickup ? (
                              <Store className="w-full h-full" />
                            ) : (
                              <MapPinIcon className="w-full h-full" />
                            )}
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center mb-4">
                              <div className={`p-3 rounded-lg ${shippingInfo.isPickup ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'} mr-3`}>
                                {shippingInfo.isPickup ? <Store className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  {shippingInfo.isPickup ? 'Pickup Location' : 'Shipping Address'}
                                </p>
                                <p className="font-bold text-lg text-gray-900">
                                  {shippingInfo.isPickup ? 'Our Store' : 'Delivery Address'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {shippingInfo.isPickup ? (
                                // Información del store para pickup
                                <>
                                  <div className="space-y-2">
                                    <p className="font-medium text-gray-900">
                                      Coffee Craze Store
                                    </p>
                                    <p className="text-gray-600">
                                      Tandil 1877, Córdoba
                                    </p>
                                    <div className="flex items-center text-gray-600 text-sm">
                                      <Clock className="h-4 w-4 mr-2" />
                                      <span>Mon-Fri: 9 AM - 6 PM | Sat: 10 AM - 2 PM</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium flex items-center">
                                      <span className="mr-2">📱</span>
                                      Bring your order confirmation and ID
                                    </p>
                                  </div>
                                  
                                  <button
                                    onClick={() => window.open('https://maps.google.com/?q=Tandil+1877,+Córdoba', '_blank')}
                                    className="w-full mt-4 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Open in Google Maps
                                  </button>
                                </>
                              ) : (
                                // Dirección de envío normal - MEJORADA
                                <>
                                  {shippingInfo.address && (
                                    <div className="space-y-3">
                                      <div className="flex items-start">
                                        <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                          <MapPin className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900 text-lg">
                                            {shippingInfo.address}
                                          </p>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {shippingInfo.city && (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {shippingInfo.city}
                                              </span>
                                            )}
                                            {shippingInfo.postal_code && (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <span className="mr-1">#</span>
                                                CP: {shippingInfo.postal_code}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-2 mt-4">
                                        <button
                                          onClick={() => openInGoogleMaps(shippingInfo.address, shippingInfo.city)}
                                          className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                                        >
                                          <Navigation className="h-4 w-4 mr-2" />
                                          View Map
                                        </button>
                                        <button
                                          onClick={() => router.push('/tracking')}
                                          className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                                        >
                                          <Package className="h-4 w-4 mr-2" />
                                          Track Order
                                        </button>
                                      </div>
                                      
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-xs text-gray-500">Delivery Status</p>
                                            <div className="flex items-center">
                                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                              <span className="text-sm font-medium text-gray-900">Package Prepared</span>
                                            </div>
                                          </div>
                                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                            Est. {shippingInfo.estimated_days} days
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Help Information - Sin cambios */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
                <h4 className="font-semibold text-yellow-800 mb-4 flex items-center">
                  <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg mr-3">
                    💡
                  </span>
                  What&apos;s next?
                </h4>
                
                <ul className="text-sm text-yellow-700 space-y-2">
                  {status === 'approved' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>You will receive a confirmation email shortly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Your order is being processed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <p className="text-sm text-yellow-700">
                          {shippingInfo?.isPickup ? (
                            shippingInfo.estimated_days === 0 
                              ? 'Your order is ready for pickup today at our store'
                              : `Your order will be ready for pickup in ${shippingInfo.estimated_days} business days`
                          ) : (
                            `Estimated delivery time: ${shippingInfo?.estimated_days} business days`
                          )}
                        </p>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Track your order in your account</span>
                      </li>
                    </>
                  )}
                  {status === 'pending' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Your payment is being processed by the bank</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>This may take up to 24 hours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>You will receive an email when confirmed</span>
                      </li>
                    </>
                  )}
                  {status === 'failure' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Please check your payment method details</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Ensure you have sufficient funds</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>Try again or use a different payment method</span>
                      </li>
                    </>
                  )}
                </ul>
                
                <div className="mt-8 pt-6 border-t border-yellow-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 mb-1">Need assistance?</p>
                    <Link href="/contact-us">
                      <span className="text-base font-semibold text-yellow-800 hover:text-yellow-900 underline flex items-center cursor-pointer">
                        Contact Support →
                      </span>
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-600">Available 24/7</p>
                    <p className="text-sm font-medium text-yellow-800">coffecraze1@gmail.com</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Summary & Info - Sin cambios */}
            <div className="space-y-8">
              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="h-6 w-6 text-gray-600 mr-3" />
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Products Subtotal</span>
                    <span className="font-semibold">{formatCurrency(productsSubtotal)}</span>
                  </div>
                  
                  {shippingCost > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-3">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(shippingCost)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center py-3">
                      <span className="font-bold text-gray-900 text-lg">Total</span>
                      <span className="font-bold text-2xl text-gray-900">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    Buyer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 truncate">{email}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{first_name} {last_name}</p>
                      </div>
                    </div>
                    {paymentDetails.payer.identification && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <IdCard className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Identification</p>
                          <p className="font-medium text-gray-900">
                            {paymentDetails.metadata?.user_type_doc || paymentDetails.payer.identification.type}: {paymentDetails.metadata?.user_nro_doc || paymentDetails.payer.identification.number}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {paymentDetails.payment_type_id.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(paymentDetails.date_created)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={generatePDF}
                    className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Download className="mr-3 h-5 w-5" />
                    Download Receipt
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="w-full flex items-center justify-center px-6 py-4 text-base font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <ArrowLeft className="mr-3 h-5 w-5" />
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Info Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Order questions? Email us at{' '}
              <a href="mailto:coffecraze1@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                coffecraze1@gmail.com
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © {new Date().getFullYear()} Coffee Craze. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
};