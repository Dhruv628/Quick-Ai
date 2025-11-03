import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

const useGenerateImageMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ prompt, style, publish }) => {
      const token = await getToken();
      const response = await api.post('/api/ai/image', 
        { prompt, style, publish },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data;
    },
    onError: (error) => {
      console.error('Error generating image:', error);
    }
  });
};

export default useGenerateImageMutation;
