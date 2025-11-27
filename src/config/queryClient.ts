import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Cache duration constants (in milliseconds)
 * Defines how long different types of data should be cached before being marked as stale
 */
export const CACHE_TIMES = {
  // User data: 5 minutes - changes when user updates profile
  USER: 1000 * 60 * 5,
  
  // Community data: 10 minutes - changes when community is updated
  COMMUNITY: 1000 * 60 * 10,
  
  // Community members: 5 minutes - changes when members join/leave
  COMMUNITY_MEMBERS: 1000 * 60 * 5,
  
  // Graph proposals: 2 minutes - frequently updated with votes
  PROPOSALS: 1000 * 60 * 2,
  
  // Graph data (nodes/edges): 10 minutes - stable unless proposals are accepted
  GRAPH: 1000 * 60 * 10,
  
  // Featured communities: 15 minutes - rarely changes
  FEATURED: 1000 * 60 * 15,
  
  // Search results: 5 minutes - user can refresh if needed
  SEARCH: 1000 * 60 * 5,
  
  // Comments: 3 minutes - frequently updated with new comments
  COMMENTS: 1000 * 60 * 3,
  
  // Posts: 5 minutes - updated when new posts added
  POSTS: 1000 * 60 * 5,
};

/**
 * Stale time: How long before data is considered "stale" and should be refetched
 * This is set equal to cacheTime for most data, meaning once cache expires, it's immediately stale
 * 
 * Garbage collection time: How long before unused data is removed from cache
 * Set to 1 hour to keep data in cache for a while even if not actively used
 */
const GARBAGE_COLLECTION_TIME = 1000 * 60 * 60; // 1 hour

/**
 * Create and configure the QueryClient with appropriate defaults for this application
 * 
 * Key configuration:
 * - staleTime: Determines how long data is considered fresh after being fetched
 * - cacheTime: How long data stays in cache even if not being used
 * - retry: Number of retries on failed requests
 * - retryDelay: Exponential backoff for retries
 * - Global error handling: Show toast notifications for failed queries/mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data becomes stale immediately after fetch (we'll override per query)
      gcTime: GARBAGE_COLLECTION_TIME, // Keep data in cache for 1 hour
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, etc.
      refetchOnWindowFocus: true, // Refetch when window regains focus (important for multi-tab apps)
      refetchOnReconnect: true, // Refetch when connection is restored
      refetchOnMount: true, // Refetch stale data when component mounts
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors like validation failures)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry once for network errors or 5xx errors
        return failureCount < 1;
      },
      retryDelay: 1000,
      // Global error handler for mutations
      onError: (error: any) => {
        console.error('Mutation error:', error);
        const message = error?.response?.data?.error || error?.message || 'Operation failed';
        toast.error(message);
      },
    },
  },
});

/**
 * Query key factory for organizing and accessing query keys
 * This ensures consistency and makes it easy to manage cache invalidation
 */
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    byId: (id: string) => [...queryKeys.user.all, 'byId', id] as const,
    byUsername: (username: string) => [...queryKeys.user.all, 'byUsername', username] as const,
    all_users: () => [...queryKeys.user.all, 'all'] as const,
    communities: (userId: string) => [...queryKeys.user.all, 'communities', userId] as const,
  },

  // Community queries
  community: {
    all: ['community'] as const,
    lists: () => [...queryKeys.community.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.community.all, id] as const,
    featured: () => [...queryKeys.community.all, 'featured'] as const,
    search: (query: string) => [...queryKeys.community.all, 'search', query] as const,
    members: (communityId: string) => [...queryKeys.community.all, communityId, 'members'] as const,
  },

  // Graph queries (nodes and edges)
  graph: {
    all: ['graph'] as const,
    byCommunity: (communityId: string) => [...queryKeys.graph.all, communityId] as const,
  },

  // Proposal queries (node and edge proposals)
  proposals: {
    all: ['proposals'] as const,
    byCommunity: (communityId: string) => [...queryKeys.proposals.all, communityId] as const,
    nodes: (communityId: string) => [...queryKeys.proposals.all, communityId, 'nodes'] as const,
    edges: (communityId: string) => [...queryKeys.proposals.all, communityId, 'edges'] as const,
  },

  // Post queries
  post: {
    all: ['post'] as const,
    lists: () => [...queryKeys.post.all, 'list'] as const,
    byCommunity: (communityId: string) => [...queryKeys.post.all, 'community', communityId] as const,
    search: (communityId: string, title: string) => 
      [...queryKeys.post.all, 'search', communityId, title] as const,
  },

  // Comment queries
  comment: {
    all: ['comment'] as const,
    byPost: (postId: string) => [...queryKeys.comment.all, 'post', postId] as const,
    replies: (commentId: string) => [...queryKeys.comment.all, 'replies', commentId] as const,
  },

  // Knowledge graph query results
  knowledgeGraph: {
    all: ['knowledgeGraph'] as const,
    query: (communityId: string, question: string) => 
      [...queryKeys.knowledgeGraph.all, communityId, question] as const,
  },
};
