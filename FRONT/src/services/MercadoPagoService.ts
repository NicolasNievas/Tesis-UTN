import { initMercadoPago } from '@mercadopago/sdk-react';
import axios from 'axios';
import JWTService from '@/jwt/JwtService';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
const $URL = process.env.NEXT_PUBLIC_API_URL_MERCADO_PAGO;

if (PUBLIC_KEY) {
    initMercadoPago(PUBLIC_KEY, { locale: 'es-AR' });
  } else {
    console.error('MercadoPago public key is not defined');
  }

const initiatePayment = async () => {
  const token = JWTService.getToken();
  const response = await axios.post(`${$URL}/initiate-payment`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export default {
  initiatePayment,
};