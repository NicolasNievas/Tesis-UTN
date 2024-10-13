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
        <nav className="account-sidebar w-64 bg-gray-200 text-black flex flex-col p-4 min-h-screen">
            <h2 className="text-2xl font-bold mb-6">Account</h2>
            <ul className="space-y-4 flex-grow">
                <li>
                    <Link href="/account/profile">
                        <span className={pathname === '/account/profile' ? 'font-bold' : ''}>
                            Profile
                        </span>
                    </Link>
                </li>
                <li>
                    <Link href="/account/orders">
                        <span className={pathname === '/account/orders' ? 'font-bold' : ''}>
                            Orders
                        </span>
                    </Link>
                </li>
            </ul>
            <div className="mt-auto">
                <Button
                    name="Log out"
                    className='w-full p-2 h-auto  bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light'
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