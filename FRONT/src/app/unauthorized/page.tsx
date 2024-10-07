'use client'

import Link from 'next/link';
import Button from '@/components/Button';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-6">Acceso No Autorizado</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, no tienes permisos para acceder a esta sección.
        </p>
        <Link 
          href="/">
          <Button 
            name="Volver al Inicio" 
          />
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;