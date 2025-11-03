import { Check, ChevronDown, Copy, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState('0px');

  const handleCopy = async e => {
    e.stopPropagation(); // Prevent card from expanding/collapsing
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const viewFile = async (fileUrl) => {
    if (!fileUrl) {
      toast.error("No file available for viewing.");
      return;
    }
    
    try {
      setDownloaded(true);
      
      window.open(fileUrl, '_blank')
      
      // * Reset download state after 2 seconds
      setTimeout(() => setDownloaded(false), 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to view file. Please try again.");
      setDownloaded(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight('0px');
    }
  }, [expanded]);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className='max-w-5xl transform cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-sm transition-all duration-200 ease-in-out hover:border-gray-300 hover:shadow-md'
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <h2>{item.prompt}</h2>
          <p className='text-gray-500'>
            {item.type} - {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button className='rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-1 text-[#1E40AF]'>
            {item.type}
          </button>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform duration-300 ease-in-out ${
              expanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </div>
      <div
        ref={contentRef}
        style={{ height }}
        className='overflow-hidden transition-all duration-500 ease-in-out'
      >
        <div className='pt-4'>
          {item.type === 'image' ? (
            <div className='transform transition-all duration-300 ease-in-out'>
              <img
                src={item.content}
                alt='image'
                className='w-full max-w-md transform rounded-lg shadow-sm transition-all duration-500 ease-in-out hover:scale-105'
              />
            </div>
          ) : (
            <div className='relative'>
              <div className='flex justify-between items-center'>
                {
                  item.type == 'review-resume' 
                  ? <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        viewFile(item?.fileUrl);
                      }} 
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all duration-200 ease-in-out ${
                        downloaded
                          ? 'border border-green-200 bg-green-100 text-green-700'
                          : 'border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                      }`}
                    >
                      {downloaded ? <span>Opening...</span> : <span className='flex items-center gap-1'><Eye className='h-4 w-4'/> View resume</span>}
                    </button> 
                  : <div></div>
                }
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all duration-200 ease-in-out ${
                    copied
                      ? 'border border-green-200 bg-green-100 text-green-700'
                      : 'border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className='h-3 w-3' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className='h-3 w-3' />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className='h-full max-h-96 transform overflow-y-auto text-sm text-slate-700 transition-all duration-300 ease-in-out'>
                <div className='reset-tw prose prose-sm max-w-none'>
                  <Markdown remarkPlugins={[remarkGfm]}>{item.content}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreationItem;
