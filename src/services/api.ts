import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "https://crowdgraph.onrender.com";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - log requests in development
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('[Network Error]', error.message);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      }
      return Promise.reject(error);
    }

    // Handle HTTP errors
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message || error.message;

    if (import.meta.env.DEV) {
      console.error(`[API Error ${status}]`, message);
    }

    // Don't show toast for 404s (might be expected)
    if (status === 404 && !error.config.showNotFoundError) {
      // Silently handle expected 404s
    } else if (status === 401) {
      toast.error('Unauthorized. Please log in again.');
    } else if (status === 403) {
      toast.error('Access forbidden.');
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

///////////////////////////// Community Management /////////////////////////////
// get 10 featured communities
export const getFeaturedCommunities = async () => {
  const response = await apiClient.get('/community/random');
  return response.data;
};

// search communities by title
export const searchCommunities = async (title: string) => {
  const response = await apiClient.get(`/community/search?title=${title}`);
  return response.data;
};

// search community by id
export const searchCommunityById = async (id: string) => {
  const response = await apiClient.get(`/community/${id}`);
  return response.data;
};

// get all users in community by community id
export const getUsersInCommunity = async (communityId: string) => {
  const response = await apiClient.get(`/community/${communityId}/users`);
  return response.data;
};

// join a community
export const joinCommunity = async (communityId: string, userId: string) => {
  const response = await apiClient.post(`/community/${communityId}/${userId}`);
  return response.data;
};

// leave a community
export const leaveCommunity = async (communityId: string, userId: string) => {
  const response = await apiClient.delete(`/community/${communityId}/${userId}`);
  return response.data;
};

// create a new community
export const createCommunity = async (title: string, description: string, ownerId: string) => {
  const response = await apiClient.post('/community/create', {
    title,
    description,
    ownerId,
  });
  return response.data;
};

// update a community
export const updateCommunity = async (
  communityId: string,
  title: string,
  description: string
) => {
  const response = await apiClient.put(`/community/${communityId}/update`, {
    title,
    description,
  });
  return response.data;
};

// delete a community
export const deleteCommunity = async (communityId: string) => {
  const response = await apiClient.delete(`/community/${communityId}/delete`);
  return response.data;
}

///////////////////////////// Post Management /////////////////////////////
// get all posts in community by community id
export const getPostsInCommunity = async (communityId: string) => {
  const response = await apiClient.get(`/post/${communityId}/community`);
  return response.data;
};

// create a new post
export const createPost = async (
  communityId: string,
  authorId: string,
  title: string,
  content: string
) => {
  const response = await apiClient.post('/post/create', {
    communityId,
    authorId,
    title,
    content,
  });
  return response.data;
};

// update a post
export const updatePost = async (
  postId: string,
  title: string,
  content: string
) => {
  const response = await apiClient.put(`/post/${postId}/update`, {
    title,
    content,
  });
  return response.data;
};

// delete a post
export const deletePost = async (postId: string) => {
  const response = await apiClient.delete(`/post/${postId}/delete`);
  return response.data;
};

// get post by title in community
export const getPostByTitleInCommunity = async (
  communityId: string,
  title: string
) => {
  const response = await apiClient.get(
    `/post/${communityId}/search?title=${title}`
  );
  return response.data;
};

///////////////////////////// Comment Management /////////////////////////////
// get all comments in post by post id
export const getCommentsInPost = async (postId: string) => {
  const response = await apiClient.get(`/comment/${postId}/post`);
  return response.data;
};

// get replies to a comment by comment id
export const getRepliesToComment = async (commentId: string) => {
  const response = await apiClient.get(`/comment/${commentId}/replies`);
  return response.data;
};

// create a new comment
export const createComment = async (
  postId: string,
  userId: string,
  content: string,
  parentCommentId?: string
) => {
  const response = await apiClient.post(`/comment/create`, {
    postId,
    userId,
    content,
    parentCommentId: parentCommentId || null,
  });
  return response.data;
};

// update a comment
export const updateComment = async (commentId: string, content: string) => {
  const response = await apiClient.put(`/comment/${commentId}/update`, {
    content,
  });
  return response.data;
};

// delete a comment
export const deleteComment = async (commentId: string) => {
  const response = await apiClient.delete(
    `/comment/${commentId}/delete`
  );
  return response.data;
};

// vote a comment with upvote or downvote or none as +1 or -1 or 0
export const voteComment = async (
  commentId: string,
  voteValue: number,
  userId: string
) => {
  const response = await apiClient.post(`/comment/vote`, {
    commentId,
    voteValue,
    userId,
  });
  return response.data;
};

///////////////////////////// User Management /////////////////////////////
// get all users
export const getAllUsers = async () => {
  const response = await apiClient.get(`/user`);
  return response.data;
};

// get user by id
export const getUserById = async (id: string) => {
  const response = await apiClient.get(`/user/${id}`);
  return response.data;
};

// get user by username
export const getUsersByUsername = async (username: string) => {
  const response = await apiClient.get(
    `/user/search?username=${username}`
  );
  return response.data;
};

// sign up user
export const signUpUser = async (username: string, password: string) => {
  const response = await apiClient.post(`/user/create`, {
    username,
    password,
  });
  return response.data;
};

// sign in user gives success true/false or success false and error message
export const signInUser = async (username: string, _password: string) => {
  const response = await apiClient.post('/auth/login', {
    username,
    password: _password,
  })
  console.log("signInUser response:", response.data);
  return response.data;
};

// update user
export const updateUser = async (
  userId: string,
  username: string,
  password: string
) => {
  const response = await apiClient.put(`/user/${userId}/update`, {
    username,
    password,
  });
  return response.data;
};

// delete user
export const deleteUser = async (userId: string) => {
  const response = await apiClient.delete(`/user/${userId}/delete`);
  return response.data;
};

// get communities of a user by user id
export const getCommunitiesOfUser = async (userId: string) => {
  const response = await apiClient.get(`/user/${userId}/communities`);
  return response.data;
};

// get user's credits in a community
export const getUserCredits = async (userId: string, communityId: string) => {
  const response = await apiClient.get(`/user/${userId}/${communityId}/credits`);
  return response.data;
};

///////////////////////////// Node and Edge Management /////////////////////////////
// get all nodes and edges in community by community id
export const getGraphInCommunity = async (communityId: string) => {
  const response = await apiClient.get(
    `/node/${communityId}/graph`
  );
  return response.data;
};

// get all node proposals in community by community id
export const getNodeProposalsInCommunity = async (communityId: string) => {
  const response = await apiClient.get(`/node/${communityId}/proposal`);
  return response.data;
};


// get all edge proposals in community by community id
export const getEdgeProposalsInCommunity = async (communityId: string) => {
  const response = await apiClient.get(`/edge/${communityId}/proposal`);
  return response.data;
};

// get all nodes and edges proposals in community by community id
export const getGraphProposalsInCommunity = async (communityId: string) => {
  const nodesResponse = await getNodeProposalsInCommunity(communityId);
  const edgesResponse = await getEdgeProposalsInCommunity(communityId);
  const response = {
    data: {
      success: true,
      data: {
        // nodeProposals: nodesResponse?.data,
        nodeProposals: nodesResponse?.data,
        edgeProposals: edgesResponse?.data,
      },
      error: null,
    },
  };
  // const response = await apiClient.get(`/graph/proposals/${communityId}/community`);
  return response.data;
};

// create a node proposal
export const createNodeProposal = async (
  communityId: string,
  userId: string,
  name: string,
  labels: string[],
  properties: { [key: string]: any },
  proposalType: "CREATE" | "UPDATE" | "DELETE",
  nodeId?: string
) => {
  console.log("createNodeProposal called with:", {
    communityId,
    userId,
    name,
    labels,
    properties,
    proposalType
  });
  const payload: any = {
    communityId,
    userId,
    name,
    labels,
    properties,
    proposalType,
  };
  if (nodeId) {
    payload.nodeId = nodeId;
  }
  const response = await apiClient.post(`/node/proposal`, payload);
  return response.data;
};

// create an edge proposal
export const createEdgeProposal = async (
  communityId: string,
  userId: string,
  sourceId: string,
  targetId: string,
  type: string,
  properties: { [key: string]: any },
  proposalType: "CREATE" | "UPDATE" | "DELETE",
  edgeId?: string
) => {
  const payload: any = {
    communityId,
    userId,
    sourceId,
    targetId,
    type,
    properties,
    proposalType,
  };
  if (edgeId) {
    payload.edgeId = edgeId;
  }
  const response = await apiClient.post(`/edge/proposal`, payload);
  return response.data;
};

// vote a node proposal with upvote or downvote or none as +1 or -1 or 0
export const voteNodeProposal = async (
  proposalId: string,
  vote: number,
  userId: string
) => {
  const response = await apiClient.post(`/node/proposal/vote`, {
    proposalId,
    voteValue: vote,
    userId,
  });
  return response.data;
};

// vote a edge proposal with upvote or downvote or none as +1 or -1 or 0
export const voteEdgeProposal = async (
  proposalId: string,
  vote: number,
  userId: string
) => {
  const response = await apiClient.post(`/edge/proposal/vote`, {
    proposalId: proposalId,
    voteValue: vote,
    userId: userId,
  });
  return response.data;
};

///////////////////////////// Query Management /////////////////////////////
// query knowledge graph with a question in community
export const queryKnowledgeGraph = async (
  communityId: string,
  question: string
) => {
  const response = await apiClient.post(
    `/query`,
    {
      question,
      communityId,
    }
  );
  const res = response.data;
  const result = {
    "success": res.success,
    "data": {
      "answer": res.data.answer,
      "nodes": res.data.nodes,
      "edges": res.data.edges
    }
  }
  console.log("queryKnowledgeGraph result:", result);
  return result;
};
