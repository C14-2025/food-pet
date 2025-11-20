'use client';

import { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '../Header/Header';

type Role = 'ADMIN' | 'CLIENT';

interface AuthenticatedResourceProps extends PropsWithChildren {
  allowedRoles?: Role[];
}

export const AuthenticatedResource: FC<AuthenticatedResourceProps> = ({ children, allowedRoles }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    //@ts-ignore
    if (allowedRoles && session?.user?.role) {
      //@ts-ignore
      if (!allowedRoles.includes(session.user.role)) {
        //if user not allowed, send back to where they were
        router.back();
      }
    }
  }, [status, session, allowedRoles, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-muted-foreground'>Carregando...</div>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return null;
  }

  //@ts-ignore
  if (allowedRoles && session?.user?.role && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className='min-h-screen'>
      <Header session={session} handleLogout={() => handleLogout()} initials={getInitials()} />
      <main>{children}</main>
    </div>
  );
};
