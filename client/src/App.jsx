import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import { Analytics } from "@vercel/analytics/react"

const Home = lazy(() => import('./pages/Home'));
const BlogTitles = lazy(() => import('./pages/BlogTitles'));
const Community = lazy(() => import('./pages/Community'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GenerateImages = lazy(() => import('./pages/GenerateImages'));
const Layout = lazy(() => import('./pages/Layout'));
const RemoveBackground = lazy(() => import('./pages/RemoveBackground'));
const RemoveObject = lazy(() => import('./pages/RemoveObject'));
const ReviewResume = lazy(() => import('./pages/ReviewResume'));
const WriteArticle = lazy(() => import('./pages/WriteArticle'));

const App = () => {
  return (
    <div>
      <Analytics/>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/ai' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='write-article' element={<WriteArticle />} />
            <Route path='blog-titles' element={<BlogTitles />} />
            <Route path='generate-images' element={<GenerateImages />} />
            <Route path='remove-background' element={<RemoveBackground />} />
            <Route path='remove-object' element={<RemoveObject />} />
            <Route path='review-resume' element={<ReviewResume />} />
            <Route path='community' element={<Community />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
