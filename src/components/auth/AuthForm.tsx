import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// Enhanced validation schemas
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' }),
});

const signupSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be no more than 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/(?=.*[0-9])/, { message: 'Password must contain at least one number' })
    .regex(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character (!@#$%^&*)' }),
});

type AuthFormProps = {
  type: 'login' | 'signup';
  onSuccess?: () => void;
};

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, signInWithGoogle, error, clearError } = useAuthStore();

  const schema = type === 'login' ? loginSchema : signupSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: type === 'login' 
      ? { email: '', password: '' } 
      : { username: '', email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues | SignupFormValues) => {
    setIsLoading(true);
    clearError();

    try {
      if (type === 'login') {
        await login(data as LoginFormValues);
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.',
        });
      } else {
        // Check if username is unique (in real app, this would be handled by the API)
        const signupData = data as SignupFormValues;
        const result = await signup(signupData);
        
        if (result.needsEmailConfirmation) {
          toast.success('Account created!', {
            description: 'Please check your email to confirm your account before continuing.',
          });
          // Don't call onSuccess - user needs to confirm email first
        } else {
          toast.success('Account created successfully!', {
            description: 'Welcome to Audiora! Let\'s set up your learning preferences.',
          });
          
          if (onSuccess) {
            onSuccess();
          }
        }
      }

    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('username')) {
          setError('username', { 
            type: 'manual', 
            message: 'This username is already taken' 
          });
        } else if (error.message.includes('email')) {
          setError('email', { 
            type: 'manual', 
            message: 'This email is already registered' 
          });
        } else {
          toast.error('Authentication failed', {
            description: error.message || 'Please check your credentials and try again'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearError();

    try {
      await signInWithGoogle();
      // OAuth redirect will handle the rest
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign in failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      setIsLoading(false);
    }
  };
  return (
    <div className="frosted-glass p-8 w-full max-w-md mx-auto border border-accent-teal-500/20 rounded-xl backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-cream100">
        {type === 'login' ? 'Welcome Back' : 'Create Your Account'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full mb-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-3 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-accent-teal-500/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-base-dark2 px-2 text-text-cream400">Or continue with email</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="username" className="text-text-cream200">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              className={`bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 placeholder:text-text-cream400/60 transition-all duration-300 ${
                errors.username ? 'border-red-500 focus:border-red-500' : ''
              }`}
              {...register('username')}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-text-cream200">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 placeholder:text-text-cream400/60 transition-all duration-300 ${
              errors.email ? 'border-red-500 focus:border-red-500' : ''
            }`}
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-text-cream200">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 placeholder:text-text-cream400/60 pr-10 transition-all duration-300 ${
                errors.password ? 'border-red-500 focus:border-red-500' : ''
              }`}
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-cream400 hover:text-text-cream200 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
          {type === 'signup' && (
            <div className="text-xs text-text-cream400 mt-1">
              Password must contain at least 8 characters, 1 number, and 1 special character
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full button-gradient-primary text-white font-medium py-3 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === 'login' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            type === 'login' ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
}