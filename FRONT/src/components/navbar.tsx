"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isHoverAccount, setIsHoverAccount] = useState<boolean>(false);
  const [isHoverProducts, setIsHoverProducts] = useState<boolean>(false);

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
          {/* Products Dropdown */}
          <div
            className='relative m-4'
            onMouseOver={() => setIsHoverProducts(true)}
            onMouseLeave={() => setIsHoverProducts(false)}
          >
            <Link href="/pages/products" >
            <button className="flex items-center gap-2 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
              Products
            </button>
            </Link>

            {isHoverProducts && (
              <div className='absolute z-50 w-48 top-[102%] border rounded-lg border-gray-300 bg-white text-sm'>
                <Link className='block p-2 hover:bg-gray-200' href="/products/category1">
                  Category 1
                </Link>
                <Link className='block p-2 hover:bg-gray-200' href="/products/category2">
                  Category 2
                </Link>
                <Link className='block p-2 hover:bg-gray-200' href="/products/category3">
                  Category 3
                </Link>
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
