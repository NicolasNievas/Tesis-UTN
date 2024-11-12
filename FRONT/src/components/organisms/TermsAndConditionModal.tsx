import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = () => {
  return (
    <div className="prose max-w-none">
      <h1>Terms and Conditions</h1>
      
      <p>Welcome to Coffee Craze (the "Service") provided by Nicolás Nievas (the "Company", "we" or "us"). We are pleased to offer you access to the Service, subject to these terms and conditions (the "Terms of Service") and the corresponding Privacy Policy of Coffee Craze.</p>
      
      <h2>General Terms of Service</h2>
      <p>By accessing and using the Service, you express your consent, agreement, and understanding of the Terms of Service and Privacy Policy. If you do not agree with the Terms of Service or Privacy Policy, do not use the Service.</p>
      
      <h2>Permission to Use the Service</h2>
      <p>To operate the Service, you must be a Coffee Craze customer and can access it through any device with Internet connection. You must provide your ID number and personal password, which will be provided by the application as a prerequisite for the first operation.</p>
      
      <h2>Reservation of Rights</h2>
      <p>The personal password and any additional personal authentication mechanism provided are secret and non-transferable. You assume the consequences of their disclosure to third parties, releasing Coffee Craze from any liability that may arise from it. Under no circumstances will Coffee Craze require you to provide all your data or send emails requesting any personal information.</p>
      
      <h2>Service Description</h2>
      
      <h3>Enabled Operations</h3>
      <p>Enabled operations are those that will be available to customers who must meet the requirements in force at the time to operate the Service. These may be expanded or restricted by the provider, with prior notice of not less than 60 days.</p>
      
      <h3>Service Cost</h3>
      <p>Coffee Craze may charge fees for the maintenance and/or use of this Service or those implemented in the future. Any modification to this provision will be communicated at least 60 days in advance.</p>
      
      <h3>Term</h3>
      <p>Users may terminate the relationship arising from this agreement, immediately, with no other responsibility than that derived from the expenses incurred until that moment. Coffee Craze may terminate the relationship with a minimum notice of 60 days, without further liability.</p>
      
      <h3>Intellectual Property</h3>
      <p>The software in Argentina is protected by Law 11,723, which regulates intellectual property and copyright of all creators of artistic, literary, and scientific works.</p>
      
      <h3>Information Privacy</h3>
      <p>To use the Services offered by Coffee Craze, Users must provide certain personal data. Your personal information is processed and stored on servers or magnetic media that maintain high standards of security and protection, both physical and technological.</p>
      
      <h2>Contact Us</h2>
      <ul>
        <li>For support: support@coffeecraze.com</li>
        <li>For feedback: feedback@coffeecraze.com</li>
        <li>General contact: contact@coffeecraze.com</li>
      </ul>
    </div>
  );
};

export { Modal, TermsAndConditions };