'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Refresh the session to get user data
        await refreshSession();
        
        toast.success('Successfully logged in');
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth callback failed:', error);
        toast.error('Authentication failed. Please try again.');
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
} 