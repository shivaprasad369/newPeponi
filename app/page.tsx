"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/AuthWraper';

export default function Home() {
  const router = useRouter();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [router]);
  return (
    <AuthWrapper>
      <div>
        <h1>Hello Word</h1>
      </div>
    </AuthWrapper>
  )
}

