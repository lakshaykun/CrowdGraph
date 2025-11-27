import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryClient';

/**
 * Custom hook that provides utilities for manual cache management
 * Useful when you need to invalidate or refetch cache in specific scenarios
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  return {
    // User cache invalidation
    invalidateUser: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.byId(userId) });
    },
    invalidateAllUsers: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    invalidateUserCommunities: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.communities(userId) });
    },

    // Community cache invalidation
    invalidateCommunity: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.byId(communityId) });
    },
    invalidateFeaturedCommunities: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.featured() });
    },
    invalidateAllCommunities: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all });
    },
    invalidateCommunityMembers: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.members(communityId) });
    },

    // Graph cache invalidation
    invalidateGraph: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.byCommunity(communityId) });
    },

    // Proposals cache invalidation
    invalidateProposals: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.byCommunity(communityId) });
    },

    // Posts cache invalidation
    invalidatePosts: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.byCommunity(communityId) });
    },

    // Comments cache invalidation
    invalidateComments: (postId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.byPost(postId) });
    },

    // Knowledge graph cache invalidation
    invalidateKnowledgeGraphQuery: (communityId: string, question: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.knowledgeGraph.query(communityId, question) 
      });
    },

    // Batch invalidation for critical operations
    invalidateAfterProposalVote: (communityId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.byCommunity(communityId) });
    },

    invalidateAfterMembershipChange: (communityId: string, userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.members(communityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.communities(userId) });
    },

    // Force refresh (invalidate + refetch immediately)
    refetchUser: (userId: string) => {
      queryClient.refetchQueries({ queryKey: queryKeys.user.byId(userId) });
    },
    refetchCommunity: (communityId: string) => {
      queryClient.refetchQueries({ queryKey: queryKeys.community.byId(communityId) });
    },
    refetchCommunityMembers: (communityId: string) => {
      queryClient.refetchQueries({ queryKey: queryKeys.community.members(communityId) });
    },
    refetchProposals: (communityId: string) => {
      queryClient.refetchQueries({ queryKey: queryKeys.proposals.byCommunity(communityId) });
    },
    refetchGraph: (communityId: string) => {
      queryClient.refetchQueries({ queryKey: queryKeys.graph.byCommunity(communityId) });
    },
  };
}
