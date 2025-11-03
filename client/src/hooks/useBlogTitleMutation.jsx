import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

const useBlogTitleMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ prompt, category }) => {
      const token = await getToken();
      const response = await api.post('/api/ai/blog-titles', 
        { prompt, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data;
    },
    onError: (error) => {
      console.error('Error generating article:', error);
    }
  });
};

export default useBlogTitleMutation;
