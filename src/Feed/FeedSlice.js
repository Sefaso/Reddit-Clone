import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSubredditFeed } from '../RedditHandshake/RedditHandshake.js';

// Thunk for fetching individual post + comments
export const fetchFeedThunk = createAsyncThunk(
    'feed/fetchFeed',
    async ({ subreddit, token }) => {
        const feed = await fetchSubredditFeed(subreddit, token);
        return feed;
    }
);

const feedSlice = createSlice({
    name: 'feed',
    initialState: {
        feed: [],
        nextPageToken: null,
        status: 'idle',
        error: null,
    },

    //These work for state info management
    reducers: {
        //This one loads initial feed
        createFeed: (state, action) => {
            state.feed.push(...action.payload.feed);
        },
        /*EDIT: THIS REDUCER'S LOGIC HAS BEEN ABSORBED BY THE SUCCESSFUL 
        EXTRAREDUCERS*/
        /*This one is for if the users scroll beyond the initial load,
        avoiding repeating posts Ids, which allows infinite expansion.
        Not really needed, as feed fetch is modified to retrieve by blocks,
        but it recommendable to keep and use*/
        /*expandFeed: (state, action) => {
            const existingIds = new Set(state.feed.map(post => post.id));
            //"Set" creates list of unique ids
            const newPosts = action.payload.filter(post => !existingIds.has(post.id));
            state.feed.push(...newPosts);
        }*/
    },

    //These work off the feed retrieval promise and change state accordingly
    extraReducers: (builder) => {
        builder
            //For loading
            .addCase(fetchFeedThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })

            //For success
            .addCase(fetchFeedThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.meta.arg.token === null) {
                    // Initial load: replace feed
                    state.feed = action.payload.posts;
                } else {
                    // Infinite scroll: append new posts
                    const existingIds = new Set(state.feed.map(post => post.id));
                    const newPosts = action.payload.posts.filter(post => !existingIds.has(post.id));
                    state.feed.push(...newPosts);
                }
                state.nextPageToken = action.payload.nextPageToken;
            })
            
            //For failure
            .addCase(fetchFeedThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

//These are the exports needed for Feed.js
export const selectFeed = (state) => state.feed.feed;
export const selectNextPageToken = (state) => state.feed.nextPageToken;
export const selectFeedStatus = (state) => state.feed.status;
export const selectFeedError = (state) => state.feed.error;

/*Actions for components 
(For good measure, even if not used, since the Reddit API provides all info)*/
export const { createFeed, expandFeed } = feedSlice.actions;

//And this one for the store
export default feedSlice.reducer;