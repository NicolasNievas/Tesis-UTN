import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AccountMenu: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="account-sidebar w-64 bg-gray-200 text-black flex flex-col p-4">
            <h2 className="text-2xl font-bold mb-6">Account</h2>
            <ul className="space-y-4">
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
        </nav>
    );
};

export default AccountMenu;