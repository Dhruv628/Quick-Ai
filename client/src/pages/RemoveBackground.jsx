import { Eraser, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useImageActionsMutation from '../hooks/useImageActionsMutation';
import Loader from '../components/Loader';

const RemoveBackground = () => {
  const [input, setInput] = useState('');

  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useImageActionsMutation();

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }
    if (file) {
      setInput(file);
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if(!input) {
      toast.error("Please upload a valid image file.");
    }

    mutation.mutate(
      { url: '/api/ai/remove/background', image: input },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.content);
        }
      }
    );
  };

  const isLoading = mutation.isPending;
  const error = mutation.isError
    ? mutation.error.response?.data?.message || 'Failed to remove background. Please try again.'
    : '';
  return (
    <div className='flex h-full items-start gap-4 overflow-y-scroll p-6 text-slate-700 max-lg:flex-wrap'>
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className={`w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 ${isLoading && "pointer-events-none"}`}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Background remover</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Image:</p>
        <input
          onChange={handleFileInput}
          type='file'
          accept='image/*'
          className='mt-2 w-full rounded-md border border-gray-300 p-2 px-3 text-sm placeholder-gray-400 outline-none'
          required
        />
        <p className='mt-2 text-xs text-slate-400'>
          Supports JPG, PNG and other image formats
        </p>
        <button className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg ${isLoading ? 'opacity-50 bg-[#FF4938] cursor-not-allowed' : 'bg-linear-to-r from-[#F6AB41] to-[#FF4938]'} px-4 py-2 text-sm text-white`}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
            <Eraser className='w-5' />
            Remove background
            </>
          )}
        </button>

        {error && (
          <div className='mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500'>
            {error}
          </div>
        )}
      </form>
      {/* Right col */}
      <div className='max-w-1g flex min-h-96 w-full flex-col rounded-lg border border-gray-200 bg-white p-4'>
        <div className='flex items-center gap-3'>
          <Eraser className='h-5 w-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Processed image</h1>
        </div>
        <div className={`flex flex-1 items-center justify-center`}>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Loader color='oklch(55.4% 0.046 257.417)' />
                <p className='text-sm text-slate-400'>Removing background...</p>
              </div>
            </div>
          ) : generatedContent ? (
            <img src={generatedContent} className='w-full py-4 rounded-lg object-contain' alt='Generated' />
          ) : (
            <div className='flex flex-col items-center gap-5 text-sm text-slate-400'>
              <Eraser className='h-9 w-9' />
              <p>Upload an image and click "Remove background" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
