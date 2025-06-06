import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { LanguageLevel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  language: z.string().min(1, { message: 'Please select a language' }),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'fluent']),
});

// Type for the form props
type AuthFormProps = {
  type: 'login' | 'signup';
  onSuccess?: () => void;
};

// Type for the form values based on the form type
type FormValues = z.infer<typeof loginSchema> | z.infer<typeof signupSchema>;

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, error, clearError } = useAuthStore();
  const { toast } = useToast();

  // Initialize form with the appropriate schema based on form type
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(type === 'login' ? loginSchema : signupSchema),
    defaultValues: type === 'login' 
      ? { email: '', password: '' } 
      : { name: '', email: '', password: '', language: 'spanish', level: 'beginner' as LanguageLevel },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    clearError();

    try {
      if (type === 'login') {
        await login(data);
      } else {
        await signup(data);
      }

      if (onSuccess) {
        onSuccess();
      }

      toast({
        title: type === 'login' ? 'Login successful!' : 'Account created!',
        description: type === 'login' 
          ? 'Welcome back to Audiora.' 
          : 'Welcome to Audiora! Start your language learning journey.',
      });
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Select components since they don't work directly with register
  const handleSelectChange = (field: string, value: string) => {
    setValue(field as any, value, { shouldValidate: true });
  };

  return (
    <div className="frosted-glass p-8 w-full max-w-md mx-auto border border-teal-400/20">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {type === 'login' ? 'Welcome Back' : 'Create Your Account'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              className={`bg-lapis_lazuli-600/50 border-teal-400/30 focus:border-mint-400 text-cream-900 placeholder:text-cream-500/50 ${
                errors.name ? 'border-red-500' : ''
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`bg-lapis_lazuli-600/50 border-teal-400/30 focus:border-mint-400 text-cream-900 placeholder:text-cream-500/50 ${
              errors.email ? 'border-red-500' : ''
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={`bg-lapis_lazuli-600/50 border-teal-400/30 focus:border-mint-400 text-cream-900 placeholder:text-cream-500/50 ${
              errors.password ? 'border-red-500' : ''
            }`}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>
        
        {type === 'signup' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="language">Language to Learn</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('language', value)}
                defaultValue="spanish"
                className="bg-lapis_lazuli-600/50"
              >
                <SelectTrigger className={`border-teal-400/30 focus:border-mint-400 ${
                  errors.language ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="bg-lapis_lazuli-600 border-teal-400/30">
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-sm text-destructive">{errors.language.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Your Current Level</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('level', value as LanguageLevel)}
                defaultValue="beginner"
                className="bg-lapis_lazuli-600/50"
              >
                <SelectTrigger className={`border-teal-400/30 focus:border-mint-400 ${
                  errors.level ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent className="bg-lapis_lazuli-600 border-teal-400/30">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="fluent">Fluent</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>
          </>
        )}
        
        <Button 
          type="submit" 
          className="w-full button-gradient-primary mt-6 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : type === 'login' ? 'Login' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
}