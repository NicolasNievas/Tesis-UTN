import React from 'react';
import { X, Coffee, Shield, Clock, Mail, Book, Heart } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#f9fafb] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-[#76797e]/20">
        <div className="sticky top-0 bg-[#f9fafb] border-b border-[#76797e]/20 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-[#2b373d] flex items-center gap-2">
            <Book className="h-6 w-6" />
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#76797e]/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-[#2b373d]" />
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
  const sections = [
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "Welcome to Coffee Craze",
      content: "Welcome to Coffee Craze (the 'Service') provided by Nicolás Nievas (the 'Company', 'we' or 'us'). We are pleased to offer you access to the Service, subject to these terms and conditions (the 'Terms of Service') and the corresponding Privacy Policy of Coffee Craze."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "General Terms of Service",
      content: "By accessing and using the Service, you express your consent, agreement, and understanding of the Terms of Service and Privacy Policy. If you do not agree with the Terms of Service or Privacy Policy, do not use the Service."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Service Duration & Costs",
      content: "Coffee Craze may charge fees for the maintenance and/or use of this Service or those implemented in the future. Any modification to this provision will be communicated at least 60 days in advance. Users may terminate the relationship arising from this agreement immediately."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Our Commitment",
      content: "We are committed to providing the highest quality service and maintaining the security and privacy of your information. Your personal information is processed and stored on servers or magnetic media that maintain high standards of security and protection."
    }
  ];

  const contactInfo = {
    email: "coffeecraze1@gmail.com",
    support: "coffeecraze1@gmail.com",
    feedback: "coffeecraze1@gmail.com"
  };

  return (
    <div className="text-[#2b373d]">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#171a25] to-[#2b373d] text-[#fffdf9] p-8 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-4">Coffee Craze Terms of Service</h1>
        <p className="text-[#9ca3af]">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main content */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm border border-[#76797e]/10 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[#3b82f6]">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <p className="text-[#76797e] leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}

        {/* Contact section */}
        <div className="bg-[#171a25] text-[#fffdf9] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Contact Us</h2>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-[#9ca3af]">General:</span>
              <a href={`mailto:${contactInfo.email}`} className="text-[#3b82f6] hover:underline">
                {contactInfo.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#9ca3af]">Support:</span>
              <a href={`mailto:${contactInfo.support}`} className="text-[#3b82f6] hover:underline">
                {contactInfo.support}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#9ca3af]">Feedback:</span>
              <a href={`mailto:${contactInfo.feedback}`} className="text-[#3b82f6] hover:underline">
                {contactInfo.feedback}
              </a>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[#76797e] py-4">
          <p>By using our service, you agree to these terms and conditions.</p>
          <p className="mt-2">© {new Date().getFullYear()} Coffee Craze. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export { Modal, TermsAndConditions };