'use client';

import type React from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.log('Login error:', error);
      setError('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='seu@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className='transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Senha</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Digite sua senha'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className='transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <Button
                data-testid='login-button'
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50'
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
