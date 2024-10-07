"use client"
import React from 'react';
import AccountMenu from '@/components/AccountMenu';

const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="account-layout flex min-h-screen">
            <AccountMenu />
            <main className="account-content flex-grow p-8 ">
                {children}
            </main>
        </div>
    );
};

export default AccountLayout;