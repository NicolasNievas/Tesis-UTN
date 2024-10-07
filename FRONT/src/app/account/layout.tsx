"use client"
import React from 'react';
import AccountMenu from '@/components/AccountMenu';

const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex">
            <AccountMenu />
            <div className="flex-grow p-4">
                {children}
            </div>
        </div>
    );
};

export default AccountLayout;