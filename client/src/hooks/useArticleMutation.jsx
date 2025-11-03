import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const useArticleMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ prompt, length }) => {
      const token = await getToken();
      const response = await axios.post('/api/ai/article', 
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
