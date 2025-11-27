# React Query Caching Implementation

## Overview

This project now implements **React Query (TanStack Query)** for efficient state management and automatic caching behavior. This replaces the previous manual API hook system with a production-grade caching solution that handles:

- **Automatic cache invalidation**
- **Smart stale time management**
- **Background refetching**
- **Request deduplication**
- **Optimistic updates support**

## Architecture

### 1. Query Client Configuration (`src/config/queryClient.ts`)

The `QueryClient` is configured with sensible defaults for the application:

```typescript
// Cache durations (milliseconds)
USER: 5 minutes          // User profiles
COMMUNITY: 10 minutes    // Community metadata
COMMUNITY_MEMBERS: 5 minutes
PROPOSALS: 2 minutes     // Frequently updated with votes
GRAPH: 10 minutes        // Nodes and edges
FEATURED: 15 minutes     // Rarely changes
SEARCH: 5 minutes
COMMENTS: 3 minutes
POSTS: 5 minutes

// Global settings
gcTime: 1 hour           // Keep data in cache for 1 hour (garbage collection)
retry: 2                 // Retry failed requests twice
retryDelay: exponential  // 1s, 2s, 4s, etc.
refetchOnWindowFocus: true   // Auto-refetch when window regains focus
refetchOnReconnect: true     // Auto-refetch when connection restored
refetchOnMount: true         // Refetch stale data on component mount
```

### 2. Query Key Factory (`queryKeys`)

Organized, hierarchical query keys for consistent cache management:

```typescript
queryKeys.user.byId(userId)           // User data
queryKeys.community.byId(communityId) // Community data
queryKeys.proposals.byCommunity(id)   // Proposals in community
queryKeys.graph.byCommunity(id)       // Graph data
queryKeys.knowledgeGraph.query(id, q) // Knowledge graph search results
```

### 3. Custom React Query Hooks (`src/hooks/useQueries.ts`)

Each data fetching operation has a corresponding hook with built-in cache management:

#### Query Hooks (Read-only)
```typescript
useGetCommunityById(communityId)        // 10-min cache
useGetUsersInCommunity(communityId)     // 5-min cache (changes with join/leave)
useGetGraphProposalsInCommunity(id)     // 2-min cache (frequently voted)
useSearchCommunities(title)              // 5-min cache
```

#### Mutation Hooks (Write operations)
```typescript
useJoinCommunity()        // Auto-invalidates: community members + user communities
useLeaveCommunity()       // Auto-invalidates: community members + user communities
useUpdateCommunity()      // Auto-invalidates: community metadata
useCreateNodeProposal()   // Auto-invalidates: proposals + graph data
useVoteNodeProposal()     // Auto-invalidates: all proposals
```

## Cache Invalidation Strategy

### Automatic (Built-in)
- **Mutations** automatically invalidate related caches via `onSuccess` handlers
- **Window Focus** triggers background refetch if data is stale
- **Connection Restore** refetches stale data when network reconnects

### Manual (When Needed)
Use the `useCacheInvalidation()` hook for manual control:

```typescript
const { invalidateProposals, refetchCommunity } = useCacheInvalidation();

// Invalidate proposals (mark as stale, will refetch on next access)
invalidateProposals(communityId);

// Refetch immediately
refetchCommunity(communityId);
```

## Stale Time Strategy

Different data types have different freshness requirements:

| Data Type | Stale Time | Why |
|-----------|-----------|-----|
| Featured Communities | 15 min | Rarely changes |
| Community Metadata | 10 min | Stable unless user edits |
| Graph (Nodes/Edges) | 10 min | Only changes when proposals accepted |
| Proposals | **2 min** | Frequently voted on |
| Community Members | 5 min | Changes with join/leave |
| Search Results | 5 min | User-specific, changes on new queries |
| Comments | 3 min | New comments added frequently |

### How Stale Time Works

1. **Fresh** (within stale time): Data is used from cache without refetch
2. **Stale** (past stale time): Data is used from cache, but background refetch happens
3. **Expired** (past gcTime): Data removed from cache entirely

Example: With PROPOSALS set to 2 minutes:
- At t=0: Fetch proposals ✓
- At t=1 min: Use cached proposals (fresh)
- At t=3 min: Use cached proposals BUT background refetch (stale, but available)
- At t=61 min: Cached proposals removed (garbage collected)

## Implementation in Components

### Example: CommunityDashboard.tsx

```typescript
// Fetch community data with 10-min cache
const { 
  data: communityData, 
  isLoading: communityLoading,
  refetch: refetchCommunity 
} = useGetCommunityById(communityId);

// Fetch proposals with 2-min cache (fresh content)
const { 
  data: proposalsResponse, 
  isLoading: proposalsLoading,
  refetch: refetchProposals
} = useGetGraphProposalsInCommunity(communityId);

// Mutations with automatic cache invalidation
const updateMutation = useUpdateCommunity();

const handleUpdate = async () => {
  try {
    await updateMutation.mutateAsync({
      communityId,
      title: newTitle,
      description: newDesc,
    });
    // Cache automatically invalidated in mutation's onSuccess handler
  } catch (error) {
    toast.error("Update failed");
  }
};
```

## Key Features

### 1. Request Deduplication
Multiple components requesting the same data will share a single request:

```typescript
// Both components make same request - only ONE network call
<Component1 useGetCommunityById={id} />
<Component2 useGetCommunityById={id} />
```

### 2. Automatic Background Refetch
When stale time expires but cache still exists, data refetches in background:

```typescript
// After 2 minutes, proposals become stale
// Next render triggers automatic background refetch
// User sees current cached data while fresh data loads
```

### 3. Optimistic Updates
When you vote on a proposal, cache updates immediately (mutations):

```typescript
const voteMutation = useVoteNodeProposal();

// Vote updates locally immediately before server responds
await voteMutation.mutateAsync({ proposalId, vote: 1 });
// Then server confirms and cache is official
```

### 4. Window Focus Refetch
When user returns to tab after being away, stale data auto-refetches:

```typescript
// User leaves tab for 5 minutes
// Returns to tab
// Stale proposals auto-refetch in background
// User sees updated vote counts
```

## Patterns for Different Scenarios

### Scenario 1: Browse Communities (Needs Fresh Content)
```typescript
// Featured communities - 15 min cache (low volatility)
// New users browse, see mostly current communities
// Doesn't need instant updates
```

### Scenario 2: Active Knowledge Graph Voting (Fast Updates)
```typescript
// Proposals - 2 min cache (high volatility)
// Users vote multiple times, see vote counts update
// Cache expires quickly, ensures fresh vote counts
```

### Scenario 3: User Profile Editing
```typescript
// User updates profile
// useUpdateUser mutation invalidates:
//   - user.byId cache
//   - user.all_users cache
// Instant consistency across app
```

### Scenario 4: Join/Leave Community
```typescript
// User joins community
// useJoinCommunity mutation invalidates:
//   - community.members cache
//   - user.communities cache
// Both caches refetch automatically
// Member list and user's community list stay in sync
```

## Cache Invalidation Decision Tree

Use this decision tree when deciding cache invalidation strategy:

```
User performs action
│
├─ Does action modify data? 
│  │
│  ├─ No → Just refetch if needed
│  │
│  └─ Yes → Mutation with onSuccess invalidation
│     │
│     └─ What does this action affect?
│        │
│        ├─ Only this resource → Invalidate specific resource
│        ├─ Related resources → Batch invalidate (e.g., members + user's communities)
│        └─ Multiple user lists → Invalidate parent lists
│
└─ Stale cache OK temporarily?
   │
   ├─ Yes → Use staleTime (let cache expire naturally)
   │
   └─ No → Force refetch immediately
```

## Troubleshooting

### Issue: Data Not Updating After Action
**Solution**: Check that the mutation has proper `onSuccess` invalidation:
```typescript
// ✓ Good
mutationFn: (vars) => api.updateCommunity(...),
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ 
    queryKey: queryKeys.community.byId(variables.communityId) 
  });
},

// ✗ Bad
mutationFn: (vars) => api.updateCommunity(...),
// No invalidation - cache stays stale!
```

### Issue: Too Many Network Requests
**Solution**: Increase stale time or check for multiple components fetching same data:
```typescript
// Before: staleTime: 1000 (1 second) - too frequent
// After: staleTime: 1000 * 60 * 5 (5 minutes) - reasonable
```

### Issue: Seeing Cached Data That's Too Old
**Solution**: Decrease gcTime (garbage collection time):
```typescript
// Reduce how long stale data is kept
gcTime: 1000 * 60 * 5, // Was 1 hour, now 5 minutes
```

## Performance Impact

With React Query caching:

- **Reduced Network Calls**: Request deduplication + shared cache
- **Faster Page Loads**: Data served from cache when available
- **Better UX**: Optimistic updates feel instant
- **Smart Refetching**: Background updates keep data fresh without blocking UI
- **Automatic Memory Management**: Old data garbage collected automatically

## Future Enhancements

1. **Optimistic Updates**: Update UI before server response
2. **Pagination**: Infinite queries for large result sets
3. **Mutations Rollback**: Revert on error
4. **Focus-based Refetch**: More granular control per query
5. **Offline Support**: Queue mutations while offline

## References

- [React Query Docs](https://tanstack.com/query/latest)
- [Caching Strategies](https://tanstack.com/query/latest/docs/react/caching)
- [Query Keys](https://tanstack.com/query/latest/docs/react/query-keys)
