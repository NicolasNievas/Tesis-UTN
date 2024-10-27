import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/data.context';
import Button from '../atoms/Button';

const AccountMenu: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthContext();

    return (
        <nav className="account-sidebar w-64 bg-gray-bg text-black flex flex-col p-6 min-h-screen shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-black-btn">Account</h2>
            <ul className="space-y-6 flex-grow">
                <li>
                    <Link href="/account/profile">
                        <span className={`block p-3 rounded-md transition-colors duration-200 cursor-pointer ${pathname === '/account/profile' ? 'bg-blue text-white' : 'hover:bg-gray-200'}`}>
                            Profile
                        </span>
                    </Link>
                </li>
                <li>
                    <Link href="/account/orders">
                        <span className={`block p-3 rounded-md transition-colors duration-200 cursor-pointer ${pathname === '/account/orders' ? 'bg-blue text-white' : 'hover:bg-gray-200'}`}>
                            Orders
                        </span>
                    </Link>
                </li>
            </ul>
            <div className="mt-auto">
                <Button
                    name="Log out"
                    className='w-full p-3 h-auto bg-black-btn hover:bg-black-hover hover:text-white text-white rounded-md'
                    onClick={() => {
                        logout();
                        router.push('/');
                    }} 
                />
            </div>
        </nav>
    );
};

export default AccountMenu;