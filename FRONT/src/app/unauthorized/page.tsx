'use client'

import Link from 'next/link';
import Button from '@/components/atoms/Button';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-containt bg-center" 
    style={{ backgroundImage: 'url(https://s3-eu-central-1.amazonaws.com/euc-cdn.freshdesk.com/data/helpdesk/attachments/production/77168657232/original/mI-YI53nCNocgv1qexu4Xw9MYFNRUVHmcA.png?1716054224)' }}>
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-6">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          Sorry, you do not have permission to access this section.
        </p>
        <Link href="/">
          <Button name="Back to Home" />
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;