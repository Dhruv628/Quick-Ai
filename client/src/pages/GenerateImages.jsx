import { Image, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import useGenerateImageMutation from '../hooks/useGenerateImageMutation';
import Loader from '../components/Loader';

const imageStyles = [
  'Realistic',
  'Ghibli Style',
  'Anime',
  'Pixel Art',
  'Watercolor',
  'Oil Painting',
  'Cyberpunk',
  '3D Render',
  'Sketch',
  'Pop Art',
  'Comic Book',
  'Low Poly',
];

const GenerateImages = () => {
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);

  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useGenerateImageMutation();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setGeneratedContent('');
    
    mutation.mutate(
      { prompt: input, style: selectedStyle, publish },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.content);
        }
      }
    );
  };

  const isLoading = mutation.isPending;
  const error = mutation.isError 
    ? mutation.error.response?.data?.message || 'Failed to generate image. Please try again.'
    : '';

  return (
    <div className='flex h-full items-start gap-4 overflow-y-scroll p-6 text-slate-700 max-lg:flex-wrap'>
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className={`w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 ${isLoading && "pointer-events-none"}`}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Ai Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Describe Your Image:</p>
        <textarea
          onChange={e => setInput(e.target.value)}
          type='text'
          className='mt-2 min-h-28 w-full rounded-md border border-gray-300 p-2 px-3 text-sm placeholder-gray-400 outline-none'
          placeholder='Describe what you want to see in the image...'
          required
        ></textarea>
        <p className='mt-6 text-sm font-medium'>Style:</p>
        <div className='mt-3 grid grid-cols-3 gap-3 sm:max-w-9/11'>
          {imageStyles.map((item, index) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`max-w-28 cursor-pointer rounded-full border px-4 py-1 text-center text-xs ${
                selectedStyle === item
                  ? 'bg-green-50 text-[#00AD25]'
                  : 'border-gray-300 text-slate-500'
              }`}
              key={index}
            >
              {item}
            </span>
          ))}
        </div>
        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input
              type='checkbox'
              onChange={e => setPublish(e.target.checked)}
              checked={publish}
              className='peer sr-only'
            />
            <div className='h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-green-500'></div>
            <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-4'></span>
          </label>
          <p className='font-slate-400 text-sm'>Make this image public</p>
        </div>

        <button className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg ${isLoading ? 'opacity-50 bg-[#00AD25] cursor-not-allowed' : 'bg-linear-to-r from-[#00AD25] to-[#04FF50]' } px-4 py-2 text-sm text-white`}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <Image className='w-5' />
              Generate image
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
          <Image className='h-5 w-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Generated image</h1>
        </div>
        <div className={`flex flex-1 items-center justify-center`}>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Loader color='oklch(55.4% 0.046 257.417)' />
                <p className='text-sm text-slate-400'>Generating your image...</p>
              </div>
            </div>
          ) : generatedContent ? (
            <img src={generatedContent} className='w-full h-max py-4 rounded-lg object-cover' alt='Generated' />
          ) : (
            <div className='flex h-full flex-col items-center justify-center gap-5 text-sm text-slate-400'>
              <Image className='h-9 w-9' />
              <p>Describe an image and click "Generate image" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
