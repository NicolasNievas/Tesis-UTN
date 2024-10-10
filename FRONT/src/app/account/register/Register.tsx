'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LOGIN_VIEW } from '@/interfaces/enums';
import { useAuthContext } from '@/context/data.context';
import Button from '@/components/atoms/Button';

interface IRegisterProps {
    setCurrentView: (view: LOGIN_VIEW) => void;
}

const Register = ({ setCurrentView }: IRegisterProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phoneNumber: '',
    address: '',
    city: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Redirigir si el usuario ya está autenticado
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Registration successful! Please verify your email.');
      setCurrentView(LOGIN_VIEW.VERIFY_EMAIL);
    } catch (error) {
      if (error instanceof Error) {
        // Manejar mensajes de error específicos del backend
        const errorMessage = error.message.includes('already exists') 
          ? error.message 
          : 'Registration failed. Please try again.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-pages" className="w-2/4 mb-32 mt-16">
      <div id="onboarding-card" className="min-w-full m-auto bg-gray-bg ">
        <div 
          id="onboarding-form" 
          className="p-8 rounded-xl bg-gray-bg flex flex-col justify-center w-full text-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
        >
          <h2 className="text-xl font-bold">
          BECOME A MEMBER
          </h2>
          <p className="text-">Create your Member profile, and get access to an enhanced shopping experience.</p>
          <form className="relative" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                title='Enter your email'
                value={formData.email}
                onChange={handleChange}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
                disabled={isLoading}
              />
            </div>
  
            {/* Password Field */}
            <div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                title='Enter your password'
                value={formData.password}
                onChange={handleChange}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
  
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  placeholder="First Name"
                  title="Enter your first name"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  placeholder="Last Name"
                  title="Enter your last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
  
            {/* Contact Information */}
            <div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder='Phone Number'
                title='Enter your phone number'
                value={formData.phoneNumber}
                onChange={handleChange}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
                disabled={isLoading}
              />
            </div>
  
            {/* Address Fields */}
            <div>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Address"
                title="Enter your address"
                value={formData.address}
                onChange={handleChange}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
                disabled={isLoading}
              />
            </div>

            {/* City Field */}
            <div>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                title="Enter your city"
                value={formData.city}
                onChange={handleChange}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
                disabled={isLoading}
              />
            </div>
  
            <Button 
              name="Sign up" 
              className='w-full h-[80px] p-2 text-sm bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light' 
              isDisabled={isLoading} 
            />
          </form>
          <div>
            <button 
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} 
              className="hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;