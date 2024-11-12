import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AdminFAQ = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const faqs = [
    {
      id: 'products',
      title: 'Product Management',
      content: [
        'Create new products with all their information',
        'Update existing product information',
        'Deactivate products that are no longer available',
        'Reactivate previously deactivated products',
        'View list of all products (paginated)',
        'Filter deactivated products',
        'View products with no stock'
      ]
    },
    {
      id: 'brands',
      title: 'Brand Management',
      content: [
        'Create new brands',
        'Update existing brand information',
        'Deactivate brands',
        'Reactivate brands',
        'View complete list of brands'
      ]
    },
    {
      id: 'categories',
      title: 'Category Management',
      content: [
        'Create categories associated with brands',
        'Update category information',
        'Deactivate categories',
        'Reactivate categories',
        'View categories by brand'
      ]
    },
    {
      id: 'orders',
      title: 'Order Management',
      content: [
        'View all purchase orders',
        'Filter orders by status',
        'Filter orders by date range',
        'Update order status',
        'Paginated order visualization',
        'View specific details of each order'
      ]
    },
    {
      id: 'inventory',
      title: 'Stock Movements Management',
      content: [
        'View all stock movements',
        'Filter movements by type (Income/Expense)',
        'Filter movements by date range',
        'View specific details of each movement'
      ]
    },
    {
      id: 'providers',
      title: 'Purchase Orders Management',
      content: [
        'View list of providers',
        'Create purchase orders to providers',
        'Obtain provider delivery response',
        'Confirm provider deliveries'
      ]
    },
    {
      id: 'reports',
      title: 'Reports and Statistics',
      content: [
        'Generate reports of most used payment methods',
        'Filter reports by date range',
        'View best-selling products',
        'Analyze sales trends',
        'Export reports to PDF and Excel'
      ]
    }
  ];

  const midPoint = Math.ceil(faqs.length / 2);
  const leftColumnFaqs = faqs.slice(0, midPoint);
  const rightColumnFaqs = faqs.slice(midPoint);

  interface FAQSectionProps {
    sectionData: {
      id: string;
      title: string;
      content: string[];
    };
    openSection: string | null;
    setOpenSection: (id: string | null) => void;
  }

  const FAQSection: React.FC<FAQSectionProps> = ({ sectionData }) => (
    <div
      key={sectionData.id}
      className="border bg-white border-gray-txt rounded-lg overflow-hidden shadow-sm mb-4 transition-all duration-200 hover:shadow-md"
    >
      <button
        className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-black hover:text-white transition-all duration-200"
        onClick={() => setOpenSection(openSection === sectionData.id ? null : sectionData.id)}
      >
        <h3 className="text-lg font-semibold">{sectionData.title}</h3>
        {openSection === sectionData.id ? (
          <ChevronUp className="w-5 h-5 transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-5 h-5 transition-transform duration-200" />
        )}
      </button>
      
      {openSection === sectionData.id && (
        <div className="p-4 bg-white">
          <ul className="list-disc list-inside space-y-2">
            {sectionData.content.map((item, index) => (
              <li 
                key={index} 
                className="text-gray-600 hover:text-black transition-colors duration-200 pl-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 ">
      {/* Alert */}
      <div className="mb-8 bg-white border-l-4 border-black p-6 rounded-lg shadow-md max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-3">
          Administrator Guide - Coffee E-commerce System
        </h2>
        <p className="text-gray-600">
          This guide details all the features available to system administrators.
          Each section can be expanded to view more details.
        </p>
      </div>

      {/* FAQ Grid Container */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {leftColumnFaqs.map((section) => (
            <FAQSection 
              key={section.id} 
              sectionData={section} 
              openSection={openSection}
              setOpenSection={setOpenSection}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {rightColumnFaqs.map((section) => (
            <FAQSection 
              key={section.id} 
              sectionData={section}
              openSection={openSection}
              setOpenSection={setOpenSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminFAQ;