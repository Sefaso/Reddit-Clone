import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostData } from '../RedditHandshake/RedditHandshake.js';

// Thunk for fetching individual post + comments
export const fetchPostThunk = createAsyncThunk(
  'post/fetchPost',
  async (postPath) => {
    const { post, comments } = await fetchPostData(postPath);
    return { post, comments };
  }
);

//Creates slice for store with necessary methods
const postSlice = createSlice({
  name: 'post',
  initialState: {
    post: null, //Post's main data
    comments: [], //Post's comments
    status: 'idle', //Retrieval lifecycle indicator
    error: null //Error indicator
  },

  //These work for state info management
  //Action creator for post
  reducers: {
    showcasePost: (state, action) => {
      state.post = action.payload;
    }
  },

  //These work off the post retrieval promise and change state accordingly
  extraReducers: (builder) => {
    builder
      //For loading
      .addCase(fetchPostThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      //For success
      .addCase(fetchPostThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.post = action.payload.post;
        state.comments = action.payload.comments;
      })
      //For failure
      .addCase(fetchPostThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

//These are the exports needed for Post.js
export const selectPost = (state) => state.post.post;
export const selectComments = (state) => state.post.comments;
export const selectPostStatus = (state) => state.post.status;
export const selectPostError = (state) => state.post.error;

/*Actions for components 
(For good measure, even if not used, since the Reddit API provides all info)*/
export const { showcasePost } = postSlice.actions;

//And this one for the store
export default postSlice.reducer;