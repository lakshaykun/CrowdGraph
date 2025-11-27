import { 
  useQuery, 
  useMutation, 
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys, CACHE_TIMES } from '@/config/queryClient';
import * as api from '@/services/api';

/* ==================== USER HOOKS ==================== */

/**
 * Get a user by ID
 * Cache: 5 minutes (user profile updates are infrequent)
 */
export function useGetUserById(
  userId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.user.byId(userId),
    queryFn: async () => {
      const response = await api.getUserById(userId);
      return response?.data || response;
    },
    staleTime: CACHE_TIMES.USER,
    enabled: !!userId,
    ...options,
  });
}

/**
 * Get user by username
 * Cache: 5 minutes
 */
export function useGetUserByUsername(
  username: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.user.byUsername(username),
    queryFn: () => api.getUsersByUsername(username),
    staleTime: CACHE_TIMES.USER,
    enabled: !!username,
    ...options,
  });
}

/**
 * Get all users
 * Cache: 10 minutes (less frequently accessed)
 */
export function useGetAllUsers(options?: any) {
  return useQuery({
    queryKey: queryKeys.user.all_users(),
    queryFn: () => api.getAllUsers(),
    staleTime: CACHE_TIMES.USER,
    ...options,
  });
}

/**
 * Get communities of a specific user
 * Cache: 5 minutes
 */
export function useGetCommunitiesOfUser(
  userId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.user.communities(userId),
    queryFn: () => api.getCommunitiesOfUser(userId),
    staleTime: CACHE_TIMES.COMMUNITY,
    enabled: !!userId,
    ...options,
  });
}

/**
 * Mutation: Sign up a new user
 * Invalidates: user list
 */
export function useSignUpUser(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.signUpUser(username, password),
    onSuccess: () => {
      // Invalidate user lists after signup
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    ...options,
  });
}

/**
 * Mutation: Update user
 * Invalidates: specific user cache
 */
export function useUpdateUser(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, username, password }: { userId: string; username: string; password: string }) =>
      api.updateUser(userId, username, password),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.byId(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all_users() });
    },
    ...options,
  });
}

/**
 * Mutation: Delete user
 * Invalidates: user lists and specific user cache
 */
export function useDeleteUser(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.byId(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all_users() });
    },
    ...options,
  });
}

/* ==================== COMMUNITY HOOKS ==================== */

/**
 * Get featured communities
 * Cache: 15 minutes (rarely changes)
 */
export function useGetFeaturedCommunities(options?: any) {
  return useQuery({
    queryKey: queryKeys.community.featured(),
    queryFn: async () => {
      const response = await api.getFeaturedCommunities();
      return response?.data || response || [];
    },
    staleTime: CACHE_TIMES.FEATURED,
    ...options,
  });
}

/**
 * Search communities by title
 * Cache: 5 minutes (search results can change)
 */
export function useSearchCommunities(
  title: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.community.search(title),
    queryFn: async () => {
      const response = await api.searchCommunities(title);
      return response?.data || response || [];
    },
    staleTime: CACHE_TIMES.SEARCH,
    enabled: !!title,
    ...options,
  });
}

/**
 * Get community by ID
 * Cache: 10 minutes
 * Critical: This is used frequently in CommunityDashboard
 */
export function useGetCommunityById(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.community.byId(communityId),
    queryFn: async () => {
      const response = await api.searchCommunityById(communityId);
      return response?.data || response;
    },
    staleTime: CACHE_TIMES.COMMUNITY,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Get users in a community
 * Cache: 5 minutes (members can join/leave)
 */
export function useGetUsersInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.community.members(communityId),
    queryFn: async () => {
      const response = await api.getUsersInCommunity(communityId);
      return response?.data || response || [];
    },
    staleTime: CACHE_TIMES.COMMUNITY_MEMBERS,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Mutation: Join a community
 * Invalidates: community members and user's communities
 */
export function useJoinCommunity(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: string; userId: string }) =>
      api.joinCommunity(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.members(variables.communityId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.communities(variables.userId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Leave a community
 * Invalidates: community members and user's communities
 */
export function useLeaveCommunity(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }: { communityId: string; userId: string }) =>
      api.leaveCommunity(communityId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.members(variables.communityId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.communities(variables.userId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Create a new community
 * Invalidates: featured communities list
 */
export function useCreateCommunity(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, description, ownerId }: { title: string; description: string; ownerId: string }) =>
      api.createCommunity(title, description, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.featured() });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.lists() });
    },
    ...options,
  });
}

/**
 * Mutation: Update a community
 * Invalidates: specific community cache and featured communities
 */
export function useUpdateCommunity(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, title, description }: { communityId: string; title: string; description: string }) =>
      api.updateCommunity(communityId, title, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.byId(variables.communityId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.featured() });
    },
    ...options,
  });
}

/**
 * Mutation: Delete a community
 * Invalidates: featured communities and community lists
 */
export function useDeleteCommunity(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communityId: string) => api.deleteCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.byId(communityId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.featured() });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.lists() });
    },
    ...options,
  });
}

/* ==================== GRAPH HOOKS (Nodes & Edges) ==================== */

/**
 * Get all nodes and edges in a community
 * Cache: 10 minutes (stable unless proposals are accepted)
 */
export function useGetGraphInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.graph.byCommunity(communityId),
    queryFn: async () => {
      const response = await api.getGraphInCommunity(communityId);
      return response?.data || response;
    },
    staleTime: CACHE_TIMES.GRAPH,
    enabled: !!communityId,
    ...options,
  });
}

/* ==================== PROPOSALS HOOKS ==================== */

/**
 * Get all node and edge proposals for a community
 * Cache: 2 minutes (frequently updated with votes)
 * Important: This needs to be kept fresh due to voting activity
 */
export function useGetGraphProposalsInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.proposals.byCommunity(communityId),
    queryFn: async () => {
      const response = await api.getGraphProposalsInCommunity(communityId);
      return response?.data || response;
    },
    staleTime: CACHE_TIMES.PROPOSALS,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Get node proposals for a community
 * Cache: 2 minutes
 */
export function useGetNodeProposalsInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.proposals.nodes(communityId),
    queryFn: () => api.getNodeProposalsInCommunity(communityId),
    staleTime: CACHE_TIMES.PROPOSALS,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Get edge proposals for a community
 * Cache: 2 minutes
 */
export function useGetEdgeProposalsInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.proposals.edges(communityId),
    queryFn: () => api.getEdgeProposalsInCommunity(communityId),
    staleTime: CACHE_TIMES.PROPOSALS,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Mutation: Create a node proposal
 * Invalidates: proposals for the community and the graph
 */
export function useCreateNodeProposal(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.createNodeProposal(vars.communityId, vars.userId, vars.name, vars.labels, vars.properties, vars.proposalType, vars.nodeId),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.proposals.byCommunity(variables.communityId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.graph.byCommunity(variables.communityId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Create an edge proposal
 * Invalidates: proposals for the community and the graph
 */
export function useCreateEdgeProposal(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.createEdgeProposal(vars.communityId, vars.userId, vars.sourceId, vars.targetId, vars.type, vars.properties, vars.proposalType, vars.edgeId),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.proposals.byCommunity(variables.communityId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.graph.byCommunity(variables.communityId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Vote on a node proposal
 * Invalidates: proposals (vote count changes)
 */
export function useVoteNodeProposal(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.voteNodeProposal(vars.proposalId, vars.vote, vars.userId),
    onSuccess: () => {
      // Note: We don't have communityId here, so we invalidate all proposals
      // In a real app, you might pass communityId or use a more specific key
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
    ...options,
  });
}

/**
 * Mutation: Vote on an edge proposal
 * Invalidates: proposals (vote count changes)
 */
export function useVoteEdgeProposal(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.voteEdgeProposal(vars.proposalId, vars.vote, vars.userId),
    onSuccess: () => {
      // Invalidate all proposals since we don't have communityId
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
    ...options,
  });
}

/* ==================== POST HOOKS ==================== */

/**
 * Get posts in a community
 * Cache: 5 minutes
 */
export function useGetPostsInCommunity(
  communityId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.post.byCommunity(communityId),
    queryFn: async () => {
      const response = await api.getPostsInCommunity(communityId);
      return response?.data || response || [];
    },
    staleTime: CACHE_TIMES.POSTS,
    enabled: !!communityId,
    ...options,
  });
}

/**
 * Search posts by title in a community
 * Cache: 5 minutes
 */
export function useSearchPostByTitle(
  communityId: string,
  title: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.post.search(communityId, title),
    queryFn: () => api.getPostByTitleInCommunity(communityId, title),
    staleTime: CACHE_TIMES.SEARCH,
    enabled: !!communityId && !!title,
    ...options,
  });
}

/**
 * Mutation: Create a post
 * Invalidates: posts in the community
 */
export function useCreatePost(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.createPost(vars.communityId, vars.authorId, vars.title, vars.content),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.post.byCommunity(variables.communityId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Update a post
 * Invalidates: posts in the community
 */
export function useUpdatePost(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.updatePost(vars.postId, vars.title, vars.content),
    onSuccess: () => {
      // Invalidate all posts since we don't have communityId
      queryClient.invalidateQueries({ queryKey: queryKeys.post.lists() });
    },
    ...options,
  });
}

/**
 * Mutation: Delete a post
 * Invalidates: posts lists
 */
export function useDeletePost(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: any) => api.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.lists() });
    },
    ...options,
  });
}

/* ==================== COMMENT HOOKS ==================== */

/**
 * Get comments in a post
 * Cache: 3 minutes (frequently updated)
 */
export function useGetCommentsInPost(
  postId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.comment.byPost(postId),
    queryFn: () => api.getCommentsInPost(postId),
    staleTime: CACHE_TIMES.COMMENTS,
    enabled: !!postId,
    ...options,
  });
}

/**
 * Get replies to a comment
 * Cache: 3 minutes
 */
export function useGetRepliesToComment(
  commentId: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.comment.replies(commentId),
    queryFn: () => api.getRepliesToComment(commentId),
    staleTime: CACHE_TIMES.COMMENTS,
    enabled: !!commentId,
    ...options,
  });
}

/**
 * Mutation: Create a comment
 * Invalidates: comments in the post
 */
export function useCreateComment(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.createComment(vars.postId, vars.userId, vars.content, vars.parentCommentId),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comment.byPost(variables.postId) 
      });
    },
    ...options,
  });
}

/**
 * Mutation: Update a comment
 * Invalidates: comments in the post
 */
export function useUpdateComment(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.updateComment(vars.commentId, vars.content),
    onSuccess: () => {
      // Invalidate all comments since we don't have postId
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.all });
    },
    ...options,
  });
}

/**
 * Mutation: Delete a comment
 * Invalidates: comments in the post
 */
export function useDeleteComment(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: any) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.all });
    },
    ...options,
  });
}

/**
 * Mutation: Vote on a comment
 * Invalidates: comments
 */
export function useVoteComment(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: any) =>
      api.voteComment(vars.commentId, vars.voteValue, vars.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.all });
    },
    ...options,
  });
}

/* ==================== KNOWLEDGE GRAPH QUERY HOOKS ==================== */

/**
 * Query knowledge graph with a question
 * Cache: 5 minutes (specific questions are cached)
 * NOT cached aggressively since each question is unique
 */
export function useQueryKnowledgeGraph(
  communityId: string,
  question: string,
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.knowledgeGraph.query(communityId, question),
    queryFn: async () => {
      const response = await api.queryKnowledgeGraph(communityId, question);
      // The query API might already return the unwrapped data
      return response;
    },
    staleTime: CACHE_TIMES.SEARCH,
    enabled: !!communityId && !!question,
    ...options,
  });
}
