import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { Session } from 'next-auth';
import { FC } from 'react';

export type HeaderProps = {
  session: Session | null;
  handleLogout: () => void;
  initials: string;
};

export const Header: FC<HeaderProps> = ({ session, handleLogout, initials }) => {
  return (
    <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-bold'>Selfeats</h1>
          {/* @ts-ignore */}
          {session?.user?.role && (
            //@ts-ignore
            <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full'>{session.user.role}</span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full' data-cy='user-avatar'>
              <Avatar className='h-9 w-9 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all'>
                <AvatarFallback className='bg-gradient-to-br from-blue-600 to-indigo-600 text-white'>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>Minha Conta</p>
                <p className='text-xs leading-none text-muted-foreground' data-cy='user-email'>
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='cursor-pointer'>
              <User className='mr-2 h-4 w-4' />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-cy='logout-button'
              onClick={handleLogout}
              className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
