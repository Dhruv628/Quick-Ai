import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

const useArticleMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ prompt, length }) => {
      const token = await getToken();
      const response = await api.post('/api/ai/article', 
        { prompt, length },
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

export default useArticleMutation;
