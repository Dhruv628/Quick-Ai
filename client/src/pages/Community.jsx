import { useAuth, useUser } from '@clerk/clerk-react';
import { Heart } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import LoadingSonnerToast from '../components/LoadingSonnerToast';

const Community = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ['publicCreations'],
    queryFn: async () => {
      const token = await getToken();
      const response = await axios.get('/api/user/creations/public', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.creations || []; // * return the data directly
    },
    onError: (error) => {
      console.error('Error fetching user creations:', error);
      toast.error('Failed to load community data. Please try again later.');
    }
  });

  // * use data from React Query instead of local state
  const creations = data || [];

  const likeMutation = useMutation({
    mutationFn: async (creationId) => {
      const token = await getToken();
      const response = await axios.post(`/api/user/creations/${creationId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { creationId, updatedCreation: response.data.data };
    },
    onMutate: async (creationId) => {
      // * cancel any outgoing refetches
      await queryClient.cancelQueries(['publicCreations']);

      // * snapshot the previous value
      const previousCreations = queryClient.getQueryData(['publicCreations']);

      // * optimistically update the cache
      queryClient.setQueryData(['publicCreations'], (old) => {
        return old?.map(creation => {
          if (creation.id === creationId) {
            const isLiked = creation.likes.includes(user.id);
            return {
              ...creation,
              likes: isLiked 
                ? creation.likes.filter(id => id !== user.id) // * remove like
                : [...creation.likes, user.id] // * add like
            };
          }
          return creation;
        });
      });

      return { previousCreations };
    },
    onError: (err, creationId, context) => {
      // * rollback on error
      queryClient.setQueryData(['publicCreations'], context.previousCreations);
      toast.error('Failed to update like. Please try again.');
    }
    // * removed onSettled - no need to refetch after every like/unlike
  });

  const handleLike = async (creationId) => {
    try {
      const currentCreation = creations.find(c => c.id === creationId);
      const toastText = {
        loadingText: 'Liking...',
        successText: 'Success!',
        errorText: 'Failed to like creation.',
      }
      if(currentCreation.likes.includes(user.id)){
        // * unlike the creation
        toastText.loadingText = 'Unliking...';
        toastText.successText = 'Unliked!';
        toastText.errorText = 'Failed to unlike creation.';
      }
      await LoadingSonnerToast({
        loadingText: toastText.loadingText, 
        successText: toastText.successText, 
        errorText: toastText.errorText,
        action: async () => {
          return await likeMutation.mutateAsync(creationId);
        }
      });
    } catch (error) {
      console.error('Error liking creation:', error);
    }
  }; 

  return isLoading ? (
    <PageLoader />
  ) : (
    <div className='flex h-full flex-1 flex-col gap-4 p-6'>
      Creations
      <div className='h-full w-full overflow-y-scroll rounded-xl bg-white'>
        {creations.map((creation, index) => (
          <div
            key={index}
            className='group relative inline-block w-full pt-3 pl-3 sm:max-w-1/2 lg:max-w-1/3'
          >
            <img
              src={creation.content}
              alt=''
              className='h-full w-full rounded-lg object-cover'
            />
            <div className='absolute top-0 right-0 bottom-0 left-3 flex items-end justify-end gap-2 rounded-lg from-transparent to-black/80 p-3 text-white group-hover:justify-between group-hover:bg-linear-to-b'>
              <p className='hidden text-sm group-hover:block'>
                {creation.prompt}
              </p>
              <div className='flex items-center gap-1'>
                <p>{creation.likes.length}</p>
                <Heart
                  onClick={() => handleLike(creation.id)}
                  className={`h-5 min-w-5 cursor-pointer hover:scale-110 ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
