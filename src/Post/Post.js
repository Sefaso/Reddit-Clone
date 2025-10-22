//#region IMPORTS
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPost,
  selectComments,
  selectPostStatus,
  selectPostError,
  fetchPostThunk
} from './PostSlice';
import './Post.css';
//#endregion IMPORTS

function Post() {
  const { subreddit, postId, postTitle } = useParams();
  const postPath = `/r/${subreddit}/comments/${postId}/${postTitle}`;
  const dispatch = useDispatch();
  const post = useSelector(selectPost);
  const comments = useSelector(selectComments);
  const status = useSelector(selectPostStatus);
  const error = useSelector(selectPostError);

  useEffect(() => {
    dispatch(fetchPostThunk(postPath));
  }, [dispatch, postPath]);

  //This allows for in-comment hyperlink validation
  function linkify(text) {
    if (!text) return ''; // ✅ Prevents .replace() on undefined
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  //Non-successful state handlers
  if (status === 'loading') return <p className='status'>Loading post...</p>;
  if (status === 'failed') return <p className='status'>Error: {error}</p>;
  if (!post) return <p className='status'>Post not found.</p>;

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

  return (
    <div className="post">
      <p>
        <Link to={`/r/${post.subreddit}`}>
          r/{post.subreddit}
        </Link>
      </p>
      <h1>{post.title}</h1>
      <p>by {post.author}</p><br />
      {/*MAIN CONTENT (PHOTO OR VIDEO)
      This block checks if post media is video or image and renders accordingly*/}
      {post.is_video && post.media?.reddit_video?.fallback_url ? (
        <>
          <video className='media' src={post.media.reddit_video.fallback_url} autoPlay controls loop />
          <p className='disclaimer'>Video won't have audio due to API limitation</p>
        </>
      ) //^-> Uses '()' for implicit return after checking on conditionals
        : post.preview?.images?.[0]?.source?.url ? (
          <img className='media' src={post.preview.images[0].source.url.replace(/&amp;/g, '&')} alt={post.title} />
        ) /*^->Checks if content has image and returns using implicit return*/
          : null
      }
      <div className='counter'>
        <img className='upvote' src='/Upvote.png' /><h2>{upvoteFormatter(post.score)}</h2>
      </div>
      <br />
      <ul>
        {comments.map((comment, iterator) => (
          <React.Fragment key={iterator}>
            <li>
              <strong>{comment.author}</strong>:<br />
              <span
                dangerouslySetInnerHTML={{ __html: linkify(comment.body || '') }}
              />
              <div className='commentCounter'>
                <img className='commentUpvote' src='/Upvote.png' /><p>{upvoteFormatter(comment.score)}</p>
              </div>
            </li>
          </React.Fragment>
        ))}

      </ul>
    </div>
  );
};

export default Post;

