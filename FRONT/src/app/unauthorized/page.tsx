'use client'

import Link from 'next/link';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso No Autorizado</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, no tienes permisos para acceder a esta sección.
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-2 bg-black-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;