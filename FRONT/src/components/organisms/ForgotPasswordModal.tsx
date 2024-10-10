"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AuthService from '@/services/AuthService';
import { LOGIN_VIEW } from '@/interfaces/enums';
import Button from '@/components/atoms/Button';

interface ForgotPasswordModalProps {
  setCurrentView: (view: LOGIN_VIEW) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ setCurrentView }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AuthService.forgotPassword(email);
      toast.success('Password reset email sent successfully');
      setCurrentView(LOGIN_VIEW.RESET_PASSWORD);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md"
          />
          <Button name="Send Reset Email" />
        </form>
        <Button 
          name="Back to Sign In" 
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} 
          className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordModal;