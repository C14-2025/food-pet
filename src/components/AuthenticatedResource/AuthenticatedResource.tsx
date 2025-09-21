'use client';

import { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';

export const AuthenticatedResource: FC<PropsWithChildren> = ({ children }) => {
  const [isLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  return <>{isLoggedIn && children}</>;
};
