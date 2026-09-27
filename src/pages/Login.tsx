import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { CircleNotch } from '@phosphor-icons/react';

const loginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    try {
      const response = await apiClient.post<{ token: string; name: string; role: string }>('/auth/login', data);
      login(response.data.token, response.data.name, response.data.role);
      navigate('/overview');
    } catch (error: any) {
      setErrorMsg(error.response?.data || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
      <div className="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-[var(--color-accent)] mb-2">PoshanScan</h1>
          <p className="text-sm text-[var(--color-secondary)]">Supervisor Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              {...register('phone')}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-md focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors text-sm placeholder:text-[var(--color-secondary)]/50"
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-xs text-[var(--color-sam)] mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-md focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors text-sm"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-xs text-[var(--color-sam)] mt-1">{errors.password.message}</p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-[var(--color-sam)]/10 text-[var(--color-sam)] text-sm rounded-md border border-[var(--color-sam)]/20">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-70"
          >
            {isSubmitting ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
