import { Edit, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Loader from '../components/Loader.jsx';
import Markdown from 'react-markdown';
import useArticleMutation  from '../hooks/useArticleMutation.jsx';
import remarkGfm from 'remark-gfm';

const articleLength = [
  { length: 800, text: 'Short (500-800 words)' },
  { length: 1200, text: 'Medium (800-1200 words)' },
  { length: 1600, text: 'Long (1200+ words)' },
];

const WriteArticle = () => {
  const [selectedLength, setSelectedLength] = useState(800);
  const [input, setInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useArticleMutation();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setGeneratedContent('');
    
    mutation.mutate(
      { prompt: input, length: selectedLength },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.content);
        }
      }
    );
  };

  const isLoading = mutation.isPending;
  const error = mutation.isError 
    ? mutation.error.response?.data?.message || 'Failed to generate article. Please try again.'
    : '';

  return (
    <div className='flex h-full items-start gap-4 overflow-y-scroll p-6 text-slate-700 max-lg:flex-wrap'>
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className={`w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 ${isLoading && "pointer-events-none"}`}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Article Topic:</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          type='text'
          className='mt-2 w-full rounded-md border border-gray-300 p-2 px-3 text-sm placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:bg-gray-50'
          placeholder='The future of artificial intelligence is...'
          required
        />
        <p className='mt-6 text-sm font-medium'>Article Length:</p>
        <div className='mt-3 flex flex-wrap gap-3 sm:max-w-9/11'>
          {articleLength.map((item, index) => (
            <span
              onClick={() => !isLoading && setSelectedLength(item.length)}
              className={`rounded-full border px-4 py-1 text-xs ${
                selectedLength === item.length
                  ? 'bg-blue-50 text-blue-800'
                  : 'border-gray-300 text-slate-500'
              } ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>
        <button
          disabled={isLoading}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-all
            ${isLoading
              ? 'cursor-not-allowed bg-[#226BFF] opacity-50'
              : 'cursor-pointer bg-linear-to-r from-[#226BFF] to-[#65ADFF] hover:opacity-90'
            }`}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <Edit className='w-5' />
              Generate article
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
          <Edit className='h-5 w-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Generated article</h1>
        </div>
        <div className={`flex flex-1 ${generatedContent ? 'overflow-y-auto' : 'items-center justify-center'}`}>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Loader color='oklch(55.4% 0.046 257.417)' />
                <p className='text-sm text-slate-400'>Generating your article...</p>
              </div>
            </div>
          ) : generatedContent ? (
            <div className='reset-tw prose prose-sm'>
              <Markdown remarkPlugins={[remarkGfm]}>{generatedContent}</Markdown>
            </div>
          ) : (
            <div className='flex h-full flex-col items-center justify-center gap-5 text-sm text-slate-400'>
              <Edit className='h-9 w-9' />
              <p>Enter a topic and click "Generate article" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteArticle;
