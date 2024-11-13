"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IBrandData } from '@/interfaces/data.interfaces';
import { getAllActiveBrands } from '@/services/brandService';
import { useAuthContext } from '@/context/data.context';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isHoverAccount, setIsHoverAccount] = useState<boolean>(false);
  const [isHoverProducts, setIsHoverProducts] = useState<boolean>(false);
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { isAuthenticated, isAdmin, logout, userEmail, cart } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await getAllActiveBrands();
        setBrands(data);
      } catch (error) {
        setError('Error fetching brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsHoverAccount(false);
    setIsMenuOpen(false);
    toast.success('Sign out successfully');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav id='navbar' className="w-full bg-white text-black shadow-md relative z-40">
      <div id='navbar-container' className="mx-auto px-6 flex justify-between items-center">
        <Link href="/" onClick={handleLinkClick}>
          <Image 
            src='/logo.png'
            width={105}
            height={15}
            alt='logo'
          />
        </Link>

        <button
          className="md:hidden p-3 z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className={`
          fixed md:relative top-0 right-0 h-screen md:h-auto w-64 md:w-auto
          bg-white md:bg-transparent shadow-lg md:shadow-none
          transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
          transition-transform duration-300 ease-in-out
          flex flex-col md:flex-row
          pt-16 md:pt-0
          items-start md:items-center
          gap-2 md:gap-4
          z-40
        `}>
          {/* Admin Button */}
          {isAdmin && (
            <Link href="/admin" onClick={handleLinkClick}>
              <button className="flex items-center gap-2 p-3 w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Admin
              </button>
            </Link>
          )}

          {/* About Us Button */}
          <Link href="/about-us" onClick={handleLinkClick}>
            <button className="flex items-center gap-2 p-3 w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              About Us
            </button>
          </Link>

          {/* Contact Us Button */}
          <Link href="/contact-us" onClick={handleLinkClick}>
            <button className="flex items-center gap-2 p-3 w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><path d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0z"/><path d="M22 12L12 17 2 12"/><path d="M2 12l10 5 10-5"/></svg>
              Contact Us
            </button>
          </Link>

          {/* Products Dropdown */}
          <div
            className='relative w-full md:w-auto'
            onMouseEnter={() => setIsHoverProducts(true)}
            onMouseLeave={() => setIsHoverProducts(false)}
          >
            <Link href="/" onClick={handleLinkClick}>
              <button className="flex items-center gap-2 p-3 w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                Products
              </button>
            </Link>

            {isHoverProducts && (
              <div className='absolute z-[60] w-48 left-0 md:top-[102%] border rounded-lg border-gray-300 bg-white text-sm'>
                {loading ? (
                  <p className='p-2'>Loading...</p>
                ) : error ? (
                  <p className='p-2 text-red-500'>{error}</p>
                ) : (
                  brands.map((brand) => (
                    <Link 
                      key={brand.id} 
                      className='block p-2 hover:bg-gray-200' 
                      href={`/product/brand/${brand.id}`}
                      onClick={handleLinkClick}
                    >
                      {brand.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Account Dropdown */}
          <div
            className='relative w-full md:w-auto'
            onMouseEnter={() => setIsHoverAccount(true)}
            onMouseLeave={() => setIsHoverAccount(false)}
          >
            <button className="flex items-center gap-2 p-3 w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {isAuthenticated ? userEmail?.split('@')[0] : 'Account'}
            </button>

            {isHoverAccount && (
              <div className='absolute z-[60] w-48 left-0 md:top-[102%] border rounded-lg border-gray-300 bg-white text-sm shadow-lg'>
                {isAuthenticated ? (
                  <>
                    <div className="p-2 border-b border-gray-200">
                      <span className="text-gray-600 text-xs">{userEmail}</span>
                    </div>
                    <Link 
                      className='block p-2 hover:bg-gray-200' 
                      href="/account/profile"
                      onClick={handleLinkClick}
                    >
                      My Profile
                    </Link>
                    <Link 
                      className='block p-2 hover:bg-gray-200' 
                      href="/account/orders"
                      onClick={handleLinkClick}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='w-full text-left p-2 text-red-600 hover:bg-gray-200 border-t border-gray-200'
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    className='block p-2 hover:bg-gray-200' 
                    href="/account"
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <Link href="/cart" onClick={handleLinkClick}>
            <button className="flex items-center gap-2 p-3 border rounded-lg shadow-md w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              ({cart?.items?.length || 0})
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;