//#region FOR FEED
// Fetches the main subreddit feed (list of posts)
export async function fetchSubredditFeed(subredditPath = 'popular', after = null) {
  // Builds the correct URL depending on whether there's a pagination token
  const url = after /*"after" is the id of the last post of the initial load*/
    ? `https://www.reddit.com/r/${subredditPath}.json?after=${after}`
    : `https://www.reddit.com/r/${subredditPath}.json`;
  // Fetches the results and "jsonifies" it
  const response = await fetch(url);
  const data = await response.json();
  // Extracts posts data
  const posts = data.data.children.map(post => post.data);
  // Retrieves the pagination token for the next batch
  const nextPageToken = data.data.after;
  // Returns both posts and token
  return { posts, nextPageToken };
};
//#endregion

//#region FOR SEARCHES
// Fetches the search results list of posts
export async function fetchSearchResults(
  searchTerm, //Not set to "null" in order to trigger first result
  token) {
  // Basic search URL for 1st results
  const baseUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerm)}`;
  // If "token" has a value, the URL gets modified into its corresponding expansion
  const url = token ? `${baseUrl}&after=${token}` : baseUrl;
  // Fetches the results and "jsonifies" it
  const response = await fetch(url);
  const data = await response.json();
  // Extracts posts data
  const posts = data.data.children.map(post => post.data);
  // Retrieves the pagination token for the next batch
  const nextPageToken = data.data.after;
  // Returns both posts and token
  return { posts, nextPageToken };
};
//#endregion

//#region FOR INDIVIDUAL POSTS
// Fetches a single post and its comments
export async function fetchPostData(postPath) {
  //Result of retrieving from post .json is assigned to "response"
  const response = await fetch(`https://www.reddit.com${postPath}.json`);
  //Translates from raw response to json and assigns to "data"
  const data = await response.json();
  //Divides data into postData (Title, images, etc.)...
  const post = data[0].data.children[0].data;
  //...comments text array,
  const comments = data[1].data.children.map(comment => comment.data);
  //Returns ready info
  return { post, comments };
};
//#endregion