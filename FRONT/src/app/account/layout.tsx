'use client';
import React, { useState } from 'react';
import AccountMenu from '@/components/organisms/AccountMenu';
import { useAuthContext } from '@/context/data.context';
import { Menu, X } from 'lucide-react';

const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isAuthenticated) {
    return (
      <main className="w-full p-4 lg:p-8">
        {children}
      </main>
    );
  }

  return (
    <div className="account-layout flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white transition-colors"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMenu}
        />
      )}

      {/* Account Menu */}
      <div className={`
        fixed lg:sticky top-0 h-screen w-64 bg-gray-800 text-white
        transform transition-transform duration-300 ease-in-out z-40
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        
      `}>
        <AccountMenu />
      </div>

      {/* Main Content */}
      <main className={`
        flex-grow p-4 lg:p-8
        ${isAuthenticated ? 'w-full' : 'w-full'}
      `}>
        {children}
      </main>
    </div>
  );
};

export default AccountLayout;