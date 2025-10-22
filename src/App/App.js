//This page is for the page's functionality
import {
  Route,
  BrowserRouter,
  Routes,
  Navigate
} from 'react-router-dom';
import AppLayout from './AppLayout.js';
import Post from '../Post/Post.js';
import Feed from '../Feed/Feed.js';
import SearchResults from '../Search/Results.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to '.../r/popular' in case of no specifics*/}
        <Route path="/" element={<Navigate to="/r/popular" replace />} />
        {/* URL behaviors */}
        <Route path="/" element={<AppLayout />}>
          <Route path="r/:subreddit" element={<Feed />} />
          <Route path="r/:subreddit/comments/:postId/:PostTitle" element={<Post />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}