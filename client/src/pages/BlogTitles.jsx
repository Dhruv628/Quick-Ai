import { Hash, Sparkles } from 'lucide-react';
import { useState } from 'react';
import useBlogTitleMutation from '../hooks/useBlogTitleMutation';
import Loader from '../components/Loader';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Install this for better formatting

const blogCategories = [
  'General',
  'Technology',
  'Health',
  'Finance',
  'Education',
  'Entertainment',
  'Lifestyle',
  'Travel',
  'Food',
];

const BlogTitles = () => {
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useBlogTitleMutation();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setGeneratedContent('');
    
    mutation.mutate(
      { prompt: input, category: selectedCategory },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.content);
        }
      }
    );
  };

  const isLoading = mutation.isPending;
  const error = mutation.isError 
    ? mutation.error.response?.data?.message || 'Failed to blog titles. Please try again.'
    : '';

  return (
    <div className='flex h-full items-start gap-4 overflow-y-scroll p-6 text-slate-700 max-lg:flex-wrap'>
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className={`w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 ${isLoading && "pointer-events-none"}`}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Ai Title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword:</p>
        <input
          disabled={isLoading}
          onChange={e => setInput(e.target.value)}
          type='text'
          className='mt-2 w-full rounded-md border border-gray-300 p-2 px-3 text-sm placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:bg-gray-50'
          placeholder='The future of artificial intelligence'
          required
        />
        <p className='mt-6 text-sm font-medium'>Category:</p>
        <div className='mt-3 grid grid-cols-3 gap-3 sm:max-w-9/11'>
          {blogCategories.map((item, index) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`max-w-28 cursor-pointer rounded-full border px-4 py-1 text-center text-xs ${
                selectedCategory === item
                  ? 'bg-purple-50 text-[#8E37EB]'
                  : 'border-gray-300 text-slate-500'
              }`}
              key={index}
            >
              {item}
            </span>
          ))}
        </div>
        <button className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg ${isLoading ? 'opacity-50 from-[#C341F6] cursor-not-allowed' : 'bg-linear-to-r from-[#C341F6] to-[#8E37EB]' } px-4 py-2 text-sm text-white`}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <Hash className='w-5' />
              Generate title
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
      <div className='max-w-1g flex max-h-[600px] min-h-96 w-full flex-col rounded-lg border border-gray-200 bg-white p-4'>
        <div className='flex items-center gap-3'>
          <Hash className='h-5 w-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated titles</h1>
        </div>
        <div className={`flex flex-1 ${generatedContent ? 'overflow-y-auto' : 'items-center justify-center'}`}>
            {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Loader color='oklch(55.4% 0.046 257.417)' />
                <p className='text-sm text-slate-400'>Generating blog titles...</p>
              </div>
            </div>
          ) : generatedContent ? (
            <div className='reset-tw prose prose-sm'>
              <Markdown remarkPlugins={[remarkGfm]}>{generatedContent}</Markdown>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-5 text-sm text-slate-400'>
              <Hash className='h-9 w-9' />
              <p>Enter keywords and click "Generate title" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogTitles;
