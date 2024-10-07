'use client'
import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile  } from '@/services/UserService';
import { IUserData, UpdateUserRequest } from '@/interfaces/data.interfaces';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthContext } from '@/context/data.context';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/Button';
import { toast } from 'react-toastify';

const MyProfile: React.FC = () => {
    const [user, setUser] = useState<IUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UpdateUserRequest>({});
    const [isEditing, setIsEditing] = useState(false);
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

    const handleEdit = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                city: user.city
            });
            setIsEditing(true);
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await updateUserProfile(formData);
            toast.success('Profile updated correctly');
            setUser(updatedUser);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
    };

    return (
        <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My Profile</h1>
            {!isEditing && (
                <Button 
                    onClick={handleEdit}
                    className="w-28 p-2 h-auto text-sm bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light"
                    name='Edit'
                />
            )}
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">First Name:</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Last Name:</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Phone Number:</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Address:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">City:</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                            <Button
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                name='Cancel'
                                isDisabled={loading}
                            />
                            <Button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                name={loading ? 'Saving...' : 'Save Changes'}
                                isDisabled={loading}
                            />
                        </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Name:</h2>
                        <p className="text-gray-900">{user.firstName}, {user.lastName}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Email:</h2>
                        <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Phone Number:</h2>
                        <p className="text-gray-900">{user.phoneNumber || 'No especificado'}</p>
                    </div>
                    <div className="border-b md:border-b-0 pb-2 md:pb-0">
                        <h2 className="font-semibold text-gray-600">Address:</h2>
                        <p className="text-gray-900">{user.address || 'No especificada'}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-600">City:</h2>
                        <p className="text-gray-900">{user.city || 'No especificada'}</p>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};

export default MyProfile;