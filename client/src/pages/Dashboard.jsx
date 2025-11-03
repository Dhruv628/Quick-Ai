import { Protect, useAuth } from '@clerk/clerk-react';
import { Gem, Sparkles } from 'lucide-react';
import { useState } from 'react';
import CreationItem from '../components/dashboard/CreationItem';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);

  const { getToken, has } = useAuth();

  const hasPremiumAccess = has({plan: 'premium'});
  
  const { isLoading, error, data } = useQuery({
    queryKey: ['userCreations'],
    queryFn: async () => {
      try {
        const token = await getToken();
        const response = await api.get('/api/user/creations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreations(response?.data?.creations || []);
        return response.data;
        
      } catch (error) {
        console.error('Error fetching user creations:', error);
        toast.error('Failed to load dashboard data. Please try again later.');
      }
    }
  })

  return isLoading ? (
    <PageLoader />
  ) : (
    <div className='h-full overflow-y-auto p-6'>
      {/* Stats Cards  */}
      <div className='flex flex-wrap gap-4'>
        {/* Total Creations Card */}
        <div className='flex w-72 items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#3588F2] to-[#0BB0D7] text-white'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>
        {/* Active Plan Card */}
        <div className='flex w-72 items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              { hasPremiumAccess ? 'Premium' : 'Free' }
            </h2>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#FF61C5] to-[#9E43EE] text-white'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>
      {/* Recent Creations Cards  */}
      <div className='mt-6'>
        <p className=''>Recent Creations</p>
        <div className='mt-4 grid grid-cols-1 gap-4'>
          {creations.map(item => (
            <CreationItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
