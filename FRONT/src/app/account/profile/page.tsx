'use client'
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/UserService';
import { IUserData } from '@/interfaces/data.interfaces';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthContext } from '@/context/data.context';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const MyProfile: React.FC = () => {
    const [user, setUser] = useState<IUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/account');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const userData = await getUserProfile();
                setUser(userData);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push('/account');
                } else {
                    setError('Error al cargar el perfil del usuario');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [isAuthenticated, router]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="text-red-500 text-center p-4">
            {error}
        </div>
    );

    if (!user) return (
        <div className="text-center p-4">
            No se encontró información del usuario
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Nombre:</h2>
                        <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Email:</h2>
                        <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Teléfono:</h2>
                        <p className="text-gray-900">{user.phoneNumber || 'No especificado'}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Dirección:</h2>
                        <p className="text-gray-900">{user.address || 'No especificada'}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-600">Ciudad:</h2>
                        <p className="text-gray-900">{user.city || 'No especificada'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;