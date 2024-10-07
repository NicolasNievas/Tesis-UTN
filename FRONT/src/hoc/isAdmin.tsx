"use client"
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { useAuthContext } from '@/context/data.context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ADMIN_ROUTES = [
  '/admin',
  '/admin/products',
  '/admin/orders',
  '/admin/reports',
  '/admin/brands',
  '/admin/categories'
];

export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminComponent(props: P) {
    const { isAuthenticated, isAdmin, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAdminAccess = async () => {
        if (!loading) {
          // Verificamos si la ruta actual está en las rutas protegidas
          const isProtectedRoute = ADMIN_ROUTES.some(route => 
            pathname.startsWith(route)
          );

          if (isProtectedRoute) {
            if (!isAuthenticated) {
              router.replace('/account');
            } else if (!isAdmin) {
              router.replace('/unauthorized');
            }
          }
          setIsChecking(false);
        }
      };

      checkAdminAccess();
    }, [isAuthenticated, isAdmin, router, loading, pathname]);

    if (loading || isChecking) {
      return (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    if (!isAuthenticated || !isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}