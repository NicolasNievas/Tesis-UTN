'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '@/services/AuthService';
import JWTService from '@/jwt/JwtService';
import { Cart, LoginRequest, PasswordResetResponse, RegisterRequest, ResetPasswordRequest } from '@/interfaces/data.interfaces';
import CartService from '@/services/CartService';
import { toast } from 'react-toastify';

interface IAuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<PasswordResetResponse>;
  resetPassword: (request: ResetPasswordRequest) => Promise<PasswordResetResponse>;
  logout: () => void;
  loading: boolean;
  userEmail: string | null;
  cart: Cart | null;
  cartLoading: boolean;
  cartError: string | null;
  addToCart: (productId: number) => Promise<void>;
  getCart: () => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
}

interface IDataProvideProps {
  children: JSX.Element[] | JSX.Element | React.ReactNode;
}

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: IDataProvideProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Cart state
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // useEffect(() => {
  //   checkAuth();
  //   AuthService.setupAxiosInterceptors();
  // }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Configurar interceptores primero
        AuthService.setupAxiosInterceptors();
        
        // Verificar autenticación
        const isValid = JWTService.isTokenValid();
        setIsAuthenticated(isValid);
        
        if (isValid) {
          setIsAdmin(JWTService.isAdmin());
          setUserEmail(JWTService.getUserEmail());
          // Si está autenticado, obtener el carrito
          await getCart();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAuth = () => {
    const isValid = JWTService.isTokenValid();
    setIsAuthenticated(isValid);
    setIsAdmin(isValid && JWTService.isAdmin());
    setUserEmail(JWTService.getUserEmail());
    setLoading(false);
  };

  const login = async (request: LoginRequest) => {
    try {
      await AuthService.login(request);
      checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const register = async (request: RegisterRequest) => {
    try {
      await AuthService.register(request);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserEmail(null);
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      await AuthService.verifyEmail(email, code);
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await AuthService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (request: ResetPasswordRequest) => {
    try {
      return await AuthService.resetPassword(request);
    } catch (error) {
      throw error;
    }
  };

  const getCart = async () => {
    if (!JWTService.isTokenValid()) return;
    
    try {
      setCartLoading(true);
      const cartData = await CartService.getCart();
      setCart(cartData);
    } catch (error: any) {
      toast.error('Error getting the cart');
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to add products to the cart');
      return;
    }
  
    try {
      setCartLoading(true);
  
      // Verificar si el carrito existe
      if (!cart) {
        await getCart();
      }
  
      if (cart?.items?.some(item => item.productId === productId)) {
        toast.info('This product is already in your cart')
        return;
      }
  
      const updatedCart = await CartService.addToCart(productId);
      setCart(updatedCart);
      toast.success('Product added to cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error.status === 403) {
        toast.warning('You are not authorized to add products to the cart.');
      } else if (error.response?.data?.message?.includes('Producto ya agregado al carrito')) {
        toast.info('This product is already in your cart. To add more quantity, use the update method.');
      } else if(error.message === 'Stock insuficiente'){
        toast.info('No stock available');
      } else {
        setCartError('Error adding to cart');
        toast.error('Error adding to cart');
      }
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to update the cart');
      return;
    }

    try {
      setCartLoading(true);
      const updatedCart = await CartService.updateCartItem(productId, quantity);
      setCart(updatedCart);
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Error updating cart');
    } finally {
      setCartLoading(false);
    }
  };
  
  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to remove products from the cart');
      return;
    }

    try {
      setCartLoading(true);
      await CartService.removeCartItem(productId);
      await getCart(); 
      toast.success('Product removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error removing product from cart');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isAdmin, 
        login, 
        register, 
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout, 
        loading,
        userEmail,
        cart,
        cartLoading,
        cartError,
        addToCart,
        getCart,
        updateCartItem,
        removeFromCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}