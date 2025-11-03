import { Protect, useAuth, useClerk, useUser } from '@clerk/clerk-react';
import {
  Eraser,
  FileText,
  Hash,
  Home,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  UsersRound
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    label: 'Community',
    Icon: UsersRound,
    to: '/ai/community',
  },
  {
    label: 'Dasboard',
    Icon: Home,
    to: '/ai',
  },
  {
    label: 'Write Article',
    Icon: SquarePen,
    to: '/ai/write-article',
  },
  {
    label: 'Blog Titles',
    Icon: Hash,
    to: '/ai/blog-titles',
  },
  {
    label: 'Generate Images',
    Icon: Image,
    to: '/ai/generate-images',
  },
  {
    label: 'Remove Background',
    Icon: Eraser,
    to: '/ai/remove-background',
  },
  {
    label: 'Remove Object',
    Icon: Scissors,
    to: '/ai/remove-object',
  },
  {
    label: 'Review Resume',
    Icon: FileText,
    to: '/ai/review-resume',
  },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { has } = useAuth()
  const hasPremiumAccess = has({plan: 'premium'});
  
  const { signOut, openUserProfile } = useClerk();
  return (
    <div
      className={`top-14 h-[calc(100%-56px)] z-9999 bottom-0 flex flex-col items-center justify-between border-r border-gray-200 bg-white px-2 max-sm:absolute ${
        sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className='my-7 w-full'>
        <div className='flex max-w-fit flex-col items-start px-5'>
          <img
            onClick={openUserProfile}
            src={user.imageUrl}
            alt='user avatar'
            className='mx-auto w-13 cursor-pointer rounded-full'
          />
          <h1 className='mt-1 text-center'>{user.fullName}</h1>
        </div>
        <div className='mt-5 px-1 text-sm font-medium text-gray-600'>
          {navItems.map(({ label, Icon, to }) => {
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/ai'}
                onClick={() => setSidebar(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3.5 py-2.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                      : ''
                  }`
                }
              >
                <Icon className='h-4 w-4' />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className='flex w-full items-center justify-between gap-8 border-t border-gray-200 p-4 px-3.5'>
        <div
          onClick={openUserProfile}
          className='flex cursor-pointer items-center gap-2'
        >
          <img src={user.imageUrl} className='w-7 rounded-full' alt='' />
          <div>
            <h1 className='max-w-20 truncate text-sm font-medium'>
              {user.fullName}
            </h1>
            <p className='text-sm'>
              {hasPremiumAccess ? 'Premium' : 'Free'} Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className='w-4.5 cursor-pointer text-gray-400 transition hover:text-gray-700'
        />
      </div>
    </div>
  );
};

export default Sidebar;
