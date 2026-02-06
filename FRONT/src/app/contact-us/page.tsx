/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { sendEmail } from '@/services/MailService';
import { IContactFormData } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import { Mail, User, MessageSquare, Coffee } from 'lucide-react';
import { Modal, TermsAndConditions } from '@/components/organisms/TermsAndConditionModal';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<IContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

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
      toast.success(response.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        {/* Background con overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={'/coffeebg.png'}
            alt="coffee background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black-btn/40 to-black/30"></div>
        </div>
        
        {/* Contenedor principal */}
        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Información de contacto */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 lg:p-10 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black-btn/30 rounded-full">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
                  <p className="text-white/80 mt-1">We&apos;d love to hear from you</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Email</h3>
                    <p className="text-white/70">coffeecraze1@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Response Time</h3>
                    <p className="text-white/70">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-medium mb-3">Why Contact Us?</h3>
                <ul className="space-y-2">
                  {[
                    "Questions about our coffee blends",
                    "Wholesale inquiries",
                    "Feedback on our products",
                    "Collaboration opportunities",
                    "Store location queries"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-white/70">
                      <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-gray-bg rounded-2xl p-8 lg:p-10 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-black">Send us a Message</h2>
                <p className="text-gray-txt mt-2">Fill out the form below and we&apos;ll get back to you soon</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Nombre */}
                <div className="space-y-2">
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-black">
                    <User className="w-4 h-4" />
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all bg-gray-50"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-bg-light" />
                  </div>
                </div>

                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-black">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all bg-gray-50"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-bg-light" />
                  </div>
                </div>

                {/* Campo Mensaje */}
                <div className="space-y-2">
                  <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-black">
                    <MessageSquare className="w-4 h-4" />
                    Your Message
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all bg-gray-50 resize-none"
                    />
                    <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-bg-light" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full p-4 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-black-btn hover:bg-black-hover text-white text-xl font-medium transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="text-center text-sm text-gray-txt pt-4">
                  By submitting this form, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-brand-blue hover:text-black font-medium underline"
                  >
                    Terms and Conditions
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 z-10 opacity-20">
          <Coffee className="w-24 h-24 text-white" />
        </div>
        <div className="absolute top-8 right-8 z-10 opacity-20">
          <Coffee className="w-20 h-20 text-white transform rotate-45" />
        </div>
      </section>

      {/* Modal de Términos y Condiciones */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <TermsAndConditions />
      </Modal>
    </>
  );
};

export default ContactUs;