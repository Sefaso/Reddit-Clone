import { configureStore } from "@reduxjs/toolkit";
import searchReducer from '../Search/SearchSlice.js';
import feedReducer from '../Feed/FeedSlice.js';
import postReducer from '../Post/PostSlice.js';

export default configureStore({
    reducer: {
        post: postReducer,
        feed: feedReducer,
        search: searchReducer
    }
});