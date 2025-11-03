// * Loading Component
const PageLoader = () => (
  <div className='flex min-h-screen items-center justify-center bg-gray-50'>
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-gray-200'></div>
        <div className='absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-t-blue-500'></div>
      </div>
      <div className='text-center'>
        <h2 className='text-lg font-semibold text-gray-700'>Loading...</h2>
        <p className='text-sm text-gray-500'>
          Please wait while we load the page
        </p>
      </div>
    </div>
  </div>
);
export default PageLoader;