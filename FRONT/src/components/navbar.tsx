"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IBrandData } from '@/interfaces/data.interfaces';
import { getAllActiveBrands } from '@/services/brandService';

const Navbar = () => {
  const [isHoverAccount, setIsHoverAccount] = useState<boolean>(false);
  const [isHoverProducts, setIsHoverProducts] = useState<boolean>(false);
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <nav id='navbar' className="w-full bg-white text-black shadow-md">
      <div id='navbar-container' className="mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <Image 
            src='/Screenshot_12.png'
            width={105}
            height={15}
            alt='logo'
          />
        </Link>

        <div className="flex items-center gap-4">

          {/* About Us Button */}
          <Link href="/about-us">
            <button className="flex items-center gap-2 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              About Us
            </button>
          </Link>

          {/* Contact Us Button */}
          <Link href="/contact-us">
            <button className="flex items-center gap-2 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><path d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0z"/><path d="M22 12L12 17 2 12"/><path d="M2 12l10 5 10-5"/></svg>
              Contact Us
            </button>
          </Link>

          {/* Products Dropdown */}
          <div
            className='relative m-4'
            onMouseOver={() => setIsHoverProducts(true)}
            onMouseLeave={() => setIsHoverProducts(false)}
          >
            <Link href="">
              <button className="flex items-center gap-2 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                Products
              </button>
            </Link>

            {isHoverProducts && (
              <div className='absolute z-50 w-48 top-[102%] border rounded-lg border-gray-300 bg-white text-sm'>
                {loading ? (
                  <p className='p-2'>Loading...</p>
                ) : error ? (
                  <p className='p-2 text-red-500'>{error}</p>
                ) : (
                  brands.map((brand) => (
                    <Link key={brand.id} className='block p-2 hover:bg-gray-200' href={`/product/brand/${brand.id}`}>
                      {brand.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Account Button */}
          <div
            className='relative m-4'
            onMouseOver={() => setIsHoverAccount(true)}
            onMouseLeave={() => setIsHoverAccount(false)}
          >
            <button className="flex items-center gap-2 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </button>

            {isHoverAccount && (
              <div className='absolute z-50 w-40 top-[102%] border rounded-lg border-gray-300 bg-white text-sm'>
                <Link className='block p-2 hover:bg-gray-200' href="/pages/account">
                  Sign in
                </Link>
                <Link className='block p-2 hover:bg-gray-200' href="/pages/profile">
                  My Profile
                </Link>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <Link href="/pages/cart" passHref>
            <button className="flex items-center gap-2 p-3 border rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              (0)
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;