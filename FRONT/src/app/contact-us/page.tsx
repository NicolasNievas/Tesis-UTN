/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { sendEmail } from '@/services/MailService';
import { IContactFormData } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<IContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!formData.email.match(/^[A-Za-z0-9+_.-]+@(.+)$/)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await sendEmail.sendContactEmail(formData);
      toast.success(response.message || '¡Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={'/coffeebg.png'}
          alt="coffee background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-5 rounded-lg shadow-lg text-center max-w-3xl w-full">
        <h2 className="text-2xl mb-4">Contact Us</h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <textarea
            name="message"
            placeholder="Message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 bg-gray-800 text-white rounded-md transition-all ${
              loading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;