"use client"
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthContext } from '@/context/data.context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminComponent(props: P) {
    const { isAuthenticated, isAdmin, loading } = useAuthContext();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated || !isAdmin) {
          router.push('/account');
        }
        setIsChecking(false);
      }
    }, [isAuthenticated, isAdmin, router, loading]);

    if (loading || isChecking) {
      return <div><LoadingSpinner /></div>;
    }

    if (!isAuthenticated || !isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}