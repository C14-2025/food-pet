'use client';

import type React from 'react';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function LoginPageClient() {
  const router = useRouter();

  const [, setIsLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggedIn(true);
    router.push('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='space-y-1 text-center'>
            <CardTitle className='text-2xl font-bold tracking-tight'>Bem vindo!</CardTitle>
            <CardDescription className='text-muted-foreground'>
              Coloque suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert className='border-amber-200 bg-amber-50'>
              <AlertCircle className='h-4 w-4 text-amber-600' />
              <AlertDescription className='text-amber-800'>
                A fucionalidade de login não está implementada nesta versão da API. Você pode continuar navegando como
                visitante.
              </AlertDescription>
            </Alert>

            <form onSubmit={(event) => handleLogin(event)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='Enter your username'
                  value='Guest1978'
                  className='transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                  disabled
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  value='guest1978'
                  required
                  className='transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                  disabled
                />
              </div>

              <Button
                data-testid="login-button"
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200'
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
