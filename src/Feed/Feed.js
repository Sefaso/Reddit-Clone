//#region IMPORTS
import { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFeed,
  selectFeedStatus,
  selectFeedError,
  fetchFeedThunk,
  selectNextPageToken
} from './FeedSlice';
import './Feed.css';
//#endregion IMPORTS

function Feed() {
  //This one is to receive the term from the feed route in Routes.js
  const { subreddit } = useParams();
  const dispatch = useDispatch();
  const feed = useSelector(selectFeed);
  const status = useSelector(selectFeedStatus);
  const error = useSelector(selectFeedError);
  const nextPageToken = useSelector(selectNextPageToken);
  const location = useLocation();

  //Initial posts retriever
  useEffect(() => {
    dispatch(fetchFeedThunk({ subreddit: subreddit || 'popular', token: null }));
  }, [dispatch, subreddit]);

  //Inifnite scroll handler
  useEffect(() => {
    //Placeholder for the result of clearTimeout within handleScroll
    let timeout;
    const handleScroll = () => {
      //Creates a slight delay for optimal loading
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        //Check if user is arriving page bottom
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 8000;
        //Checks what is the nextPageToken id user is close to bottom and initial load was gotten
        if (nearBottom && status !== 'loading' && nextPageToken) {
          //Fetches further posts using the nexPageToken at hand. Fetch updates token
          dispatch(fetchFeedThunk({ subreddit: subreddit || 'popular', token: nextPageToken }));
        }
      }, 1); // debounce by 0.001s
    };
    //Creates handleScroll-linked scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, subreddit, nextPageToken, status]);

  //Non-successful state handlers
  if (status === 'loading' && feed.length === 0) {
    return <p className='status'>Loading posts...</p>;
  };//This one checks if the feed length is 0, and if not, adds without replacing
  if (status === 'failed') return <p className='status'>Error: {error}</p>;
  if (!feed || feed.length === 0) return <p className='status'>No posts found.</p>;

  //Upvote appearance handler
  const upvoteFormatter = (total) => {
    if (total >= 1000000) {
      return `${(total / 1000000).toFixed(1)}m`;
    } else if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}k`;
    } else {
      return total;
    }
  };

  //Alphabetic sorter
  const sortedSubs = [...new Set(feed.map(post => post.subreddit))].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div>

      {/*Checks if it's the home page and render exploration options*/}
      {location.pathname === '/r/popular' && (
        <div className='subreddits'>
          <h2>Explore recent subreddits:</h2>
          <ul>
            {sortedSubs.map((sub, index) => (
              <li key={index}>
                <Link to={`/r/${sub}`}>r/{sub}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="feed">
        {feed.map((post) => {
          //Creates 2 constants for mapping behavior depending on type
          const videoUrl = post.media?.reddit_video?.fallback_url;
          const imageUrl =
            post.preview?.images?.[0]?.resolutions?.slice(-1)[0]?.url?.replace(/&amp;/g, '&') ||
            post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');

          return (
            <div key={post.id}>
              <div className='container'>
                {/*This is the array's element's subreddit with a link to it*/}
                <p>
                  <Link to={`/r/${post.subreddit}`}>
                    {`r/${post.subreddit}`}
                  </Link>
                </p>
                {/*In here it creates the title and a link to the post's page*/}
                <h2>
                  <Link to={`/r/${subreddit}/comments/${post.id}/${encodeURIComponent(post.title)}`}>
                    {post.title}
                  </Link>
                </h2>
                <p>by: {post.author}</p>
                {/*In here is chosses between a video or image rendering,
            depending on kind, using the previoudly define behavior constants*/}
                {
                  post.is_video && videoUrl ? (<><video className='media' src={videoUrl} autoPlay controls loop />
                    <p className='disclaimer'>Videos won't have audio due to API limitation</p></>) : //<-Video
                    imageUrl ? (<img className='media' src={imageUrl} alt={post.title} />) : //<-Image
                      null //<-Nothing
                }
                <div className='buttons'>
                  <img className='upvote' src='/Upvote.png' />
                  <h3>{upvoteFormatter(post.score)}</h3>
                  <Link to={`/r/${subreddit}/comments/${post.id}/${encodeURIComponent(post.title)}`}> <img className='comment' src='/Comment.png' />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {/* ✅ Loading indicator for infinite scroll */}
        {status === 'loading' && <p className='status'>Loading more posts...</p>}
      </div>
    </div>
  );
};

export default Feed;