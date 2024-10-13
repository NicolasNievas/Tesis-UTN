'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LOGIN_VIEW } from '@/interfaces/enums';
import { useAuthContext } from '@/context/data.context';
import Button from '@/components/atoms/Button';
import GoogleImage from '@/components/atoms/GoogleImage';

interface ILoginProps {
    setCurrentView: (view: LOGIN_VIEW) => void;
}

const Login = ({ setCurrentView }: ILoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAdmin, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Redirigir solo cuando la autenticación se haya completado
    if (isAuthenticated) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    // Habilitar o deshabilitar el botón de inicio de sesión
    setIsDisabled(!(email && password));
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisabled(true);
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success('Sign in successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWithGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Google sign in is not yet implemented');
  }

  return (
    <div id="login-pages" className="w-2/4 mb-32 mt-16">
      <div id="onboarding-card" className="min-w-full m-auto bg-gray-bg">
        <div 
          id="onboarding-form" 
          className="p-8 rounded-xl bg-gray-bg flex flex-col justify-center w-full text-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
        >
          <h2 className="text-xl font-bold">
            WELCOME BACK
          </h2>
          <p className="text-base">Sign in to access an enhanced shopping experience.</p>
          <form className="relative" onSubmit={handleSubmitWithGoogle}>
            <GoogleImage classname="absolute bottom-[40%] left-[5%]" width={40} height={40} />
            <Button name="Continue with google" className="w-full h-[80px] hover:font-bold" />
          </form>
          <div className="w-full flex items-center before:content-[''] before:border-b-2 before:h-1.5 before:flex-1 after:border-b-2 after:h-1.5 after:flex-1">
            <span className="p-4">Or</span>
          </div>
          <form className="mt-8" onSubmit={handleSubmit}>
            <div>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                title="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                title="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border m-2 text-xl bg-white p-2 w-full rounded-lg font-extralight"
                required
              />
            </div>
            <Button 
            name="Sign in" 
            className='w-full h-[80px] p-2 text-sm bg-black-btn hover:bg-black-hover hover:text-white text-gray-bg-light' 
            isDisabled={isDisabled || isLoading} 
            />          
          </form>
          <div>
            <button 
              onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)} 
              className="hover:underline"
            >
              Create an account
            </button>
          </div>
          <div>
            <button 
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
              className="text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;