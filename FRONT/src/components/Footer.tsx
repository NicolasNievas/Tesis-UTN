import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ padding: '10px 0' }}>
      <div className="container mx-auto px-5 h-[200px]">
        <div className="flex items-center h-full flex-col lg:flex-row justify-between lg:pl-4">
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
            </svg>
            <p className='text-sm lg:text-base'>
              <Link
                className='font-extralight hover:text-blue'
                href="mailto:correo@example.com"
              >
                correo@example.com
              </Link>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
              <path d="M22 16.92V23a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2 7.18 2 2 0 0 1 4 5h6.09a2 2 0 0 1 2 1.72c.14 1.1.37 2.16.68 3.19a2 2 0 0 1-.45 1.95l-2.27 2.27a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 1.95-.45c1.03.31 2.09.54 3.19.68a2 2 0 0 1 1.72 2z"/>
            </svg>
            <p className='text-sm lg:text-base'>
              <Link
                className='font-extralight hover:text-blue'
                href="tel:+1234567890"
              >
                +1234567890
              </Link>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
              <path d="M21 10c0 5.25-8 13-8 13s-8-7.75-8-13a8 8 0 1 1 16 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p className='text-sm lg:text-base'>
              <Link
                className='font-extralight hover:text-blue'
                href="https://www.google.com/maps"
                target='_blank'
              >
                Ubicación
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;