import { NotepadText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useResumeMutation from '../hooks/useResumeMutation';
import Loader from '../components/Loader';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReviewResume = () => {
  const [input, setInput] = useState('');

  const [generatedContent, setGeneratedContent] = useState('');

  const mutation = useResumeMutation();

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
      toast.error("Please upload a valid file.");
    }

    mutation.mutate(
      { resume: input },
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
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Review resume</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Resume:</p>
        <input
          onChange={handleFileInput}
          type='file'
          accept='.pdf, .docx, .doc, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          className='mt-2 w-full rounded-md border border-gray-300 p-2 px-3 text-sm placeholder-gray-400 outline-none'
          required
        />
        <p className='mt-2 text-xs text-slate-400'>
          Supports PDF and DOC formats
        </p>
        <button className='mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#00DA83] to-[#009BB3] px-4 py-2 text-sm text-white'>
          {isLoading ? (
            <Loader />
          ) : (
            <>
            <NotepadText className='w-5' />
            Review resume
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
          <NotepadText className='h-5 w-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Analysis review</h1>
        </div>
        <div className={`flex flex-1 ${generatedContent ? 'overflow-y-auto items-center justify-center' : 'items-center justify-center'}`}>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Loader color='oklch(55.4% 0.046 257.417)' />
                <p className='text-sm text-slate-400'>Analyzing the resume...</p>
              </div>
            </div>
          ) : generatedContent ? (
            <div className='reset-tw prose prose-sm'>
              <Markdown remarkPlugins={[remarkGfm]}>{generatedContent}</Markdown>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-5 text-sm text-slate-400'>
              <NotepadText className='h-9 w-9' />
              <p>Upload your resume and click "Review resume" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewResume;
