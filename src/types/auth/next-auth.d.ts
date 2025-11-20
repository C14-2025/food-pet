// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: 'ADMIN' | 'CLIENT';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'CLIENT';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'ADMIN' | 'CLIENT';
    id?: string;
  }
}
