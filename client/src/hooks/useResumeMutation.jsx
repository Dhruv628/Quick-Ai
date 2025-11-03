import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const useResumeMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ resume }) => {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', resume);

      const response = await axios.post('/api/ai/review/resume', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
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

export default useResumeMutation;
