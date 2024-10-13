"use client"
import React from 'react';
import AccountMenu from '@/components/organisms/AccountMenu';
import { useAuthContext } from '@/context/data.context';

const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuthContext();

    return (
        <div className="account-layout flex min-h-screen">
            {isAuthenticated && <AccountMenu />}
            <main className={`account-content ${isAuthenticated ? 'flex-grow p-8' : 'w-full p-8'}`}>
                {children}
            </main>
        </div>
    );
};

export default AccountLayout;