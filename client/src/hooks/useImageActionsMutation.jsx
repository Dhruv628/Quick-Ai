import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

const useImageActionsMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ url, image, object = "" }) => {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', image);
      formData.append('object', object);

      const response = await api.post(url, 
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

export default useImageActionsMutation;
