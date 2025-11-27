# React Query Migration Guide for Other Components

This guide shows how to migrate existing components from the old `useApi` hook to React Query hooks.

## Before & After Comparison

### Old Pattern (useApi Hook)

```typescript
import { useApi } from "@/hooks/apiHook";
import { getFeaturedCommunities, searchCommunities } from "@/services/api";

function MyComponent() {
  const { 
    data: featured, 
    loading: loadingFeatured, 
    error: featuredError,
    callApi: callFeatured 
  } = useApi(getFeaturedCommunities);
  
  const { 
    data: searchResults,
    loading: searchLoading,
    callApi: callSearch
  } = useApi(searchCommunities);

  // Manual loading/error management
  useEffect(() => {
    callFeatured();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      callSearch(searchQuery);
    }
  }, [searchQuery]);

  // Inconsistent caching - no automatic invalidation
  // No request deduplication
  // Requires manual state updates
}
```

### New Pattern (React Query)

```typescript
import { 
  useGetFeaturedCommunities, 
  useSearchCommunities 
} from "@/hooks/useQueries";

function MyComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Automatic caching, stale time management
  const { 
    data: featured = [] as any, 
    isLoading: loadingFeatured 
  } = useGetFeaturedCommunities();
  
  const { 
    data: searchResults = [] as any,
    isLoading: searchLoading
  } = useSearchCommunities(searchQuery);

  // No useEffect needed - React Query handles fetching automatically!
  // Cache automatically managed
  // Request deduplication automatic
  // Retry logic built-in
}
```

## Migration Steps

### Step 1: Replace Import Statements

```typescript
// REMOVE:
import { useApi } from "@/hooks/apiHook";
import { getFeaturedCommunities, searchCommunities } from "@/services/api";

// ADD:
import { 
  useGetFeaturedCommunities, 
  useSearchCommunities 
} from "@/hooks/useQueries";
```

### Step 2: Replace useApi Hooks

```typescript
// OLD:
const { data, loading, error, callApi } = useApi(getFeaturedCommunities);

// NEW:
const { data, isLoading, error } = useGetFeaturedCommunities();
```

### Step 3: Update Loading States

```typescript
// OLD:
if (loading) return <Spinner />;

// NEW:
if (isLoading) return <Spinner />;
```

### Step 4: Remove Manual API Calls in useEffect

```typescript
// OLD:
useEffect(() => {
  callFeaturedCommunities();
}, []);

// NEW: Not needed! React Query handles this automatically

// Only keep if you need to refetch on dependency change:
const { data, refetch } = useGetFeaturedCommunities();
useEffect(() => {
  if (someCondition) {
    refetch(); // Manual refetch only when needed
  }
}, [someCondition, refetch]);
```

### Step 5: Handle Mutations

```typescript
// OLD:
try {
  const response = await createCommunity(title, description, userId);
  if (response.success) {
    // Manually refresh list
    await callFeaturedCommunities();
    toast.success("Created!");
  }
} catch (error) {
  toast.error("Failed!");
}

// NEW:
const { mutateAsync, isPending } = useCreateCommunity();
try {
  await mutateAsync({ title, description, ownerId: userId });
  // Cache automatically invalidated in mutation's onSuccess!
  toast.success("Created!");
} catch (error) {
  toast.error("Failed!");
}
```

## Common Migration Patterns

### Pattern 1: Simple Data Fetch

```typescript
// Component that just displays data

// OLD:
function CommunityList() {
  const { data: communities, loading, error, callApi } = useApi(
    getFeaturedCommunities
  );

  useEffect(() => {
    callApi();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <Communities list={communities} />;
}

// NEW:
function CommunityList() {
  const { data: communities = [], isLoading, error } = useGetFeaturedCommunities();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <Communities list={communities} />;
}
```

### Pattern 2: Search with Dependencies

```typescript
// OLD:
function SearchCommunities() {
  const [query, setQuery] = useState("");
  const { data: results, loading, callApi } = useApi(searchCommunities);

  useEffect(() => {
    if (query.trim()) {
      callApi(query);
    }
  }, [query]);

  return (
    <>
      <input onChange={(e) => setQuery(e.target.value)} />
      {loading && <Spinner />}
      <Results list={results} />
    </>
  );
}

// NEW:
function SearchCommunities() {
  const [query, setQuery] = useState("");
  const { data: results = [], isLoading } = useSearchCommunities(query);

  return (
    <>
      <input onChange={(e) => setQuery(e.target.value)} />
      {isLoading && <Spinner />}
      <Results list={results} />
    </>
  );
}
```

### Pattern 3: Create with Automatic Refetch

```typescript
// OLD:
function CreateCommunity() {
  const { callApi: callCreate } = useApi(createCommunity);
  const { callApi: callFeatured } = useApi(getFeaturedCommunities);

  const handleCreate = async (title, description) => {
    try {
      const response = await callCreate(title, description, userId);
      if (response.success) {
        // Manual refresh required
        await callFeatured();
        toast.success("Created!");
      }
    } catch (error) {
      toast.error("Failed!");
    }
  };

  return <Form onSubmit={handleCreate} />;
}

// NEW:
function CreateCommunity() {
  const { mutateAsync, isPending } = useCreateCommunity();

  const handleCreate = async (title, description) => {
    try {
      await mutateAsync({ 
        title, 
        description, 
        ownerId: userId 
      });
      // Cache automatically invalidated!
      toast.success("Created!");
    } catch (error) {
      toast.error("Failed!");
    }
  };

  return <Form onSubmit={handleCreate} disabled={isPending} />;
}
```

### Pattern 4: Multiple Dependent Queries

```typescript
// OLD:
function CommunityDetail() {
  const { id } = useParams();
  const { data: community, callApi: callCommunity } = useApi(
    searchCommunityById
  );
  const { data: members, callApi: callMembers } = useApi(
    getUsersInCommunity
  );

  useEffect(() => {
    callCommunity(id);
  }, [id]);

  useEffect(() => {
    if (community?.id) {
      callMembers(community.id);
    }
  }, [community?.id]);
  
  // Requires manual coordination
}

// NEW:
function CommunityDetail() {
  const { id } = useParams();
  const { data: community } = useGetCommunityById(id);
  const { data: members } = useGetUsersInCommunity(id);
  
  // React Query automatically handles dependencies and caching!
}
```

### Pattern 5: Voting/Interactive Actions

```typescript
// OLD:
function ProposalCard({ proposal }) {
  const { callApi: callVote } = useApi(voteNodeProposal);
  const { callApi: callRefresh } = useApi(getGraphProposalsInCommunity);

  const handleVote = async (voteValue) => {
    try {
      await callVote(proposal.id, voteValue, userId);
      // Manual cache refresh
      await callRefresh(communityId);
    } catch (error) {
      toast.error("Vote failed!");
    }
  };

  return <VoteButtons onVote={handleVote} />;
}

// NEW:
function ProposalCard({ proposal }) {
  const { mutateAsync: vote } = useVoteNodeProposal();

  const handleVote = async (voteValue) => {
    try {
      await vote({ 
        proposalId: proposal.id, 
        vote: voteValue, 
        userId 
      });
      // Cache automatically invalidated!
      toast.success("Vote counted!");
    } catch (error) {
      toast.error("Vote failed!");
    }
  };

  return <VoteButtons onVote={handleVote} />;
}
```

## Hook Mapping Reference

### Query Hooks (for reading data)

```typescript
// User queries
useGetUserById(userId)
useGetUserByUsername(username)
useGetAllUsers()
useGetCommunitiesOfUser(userId)

// Community queries
useGetFeaturedCommunities()
useSearchCommunities(title)
useGetCommunityById(communityId)
useGetUsersInCommunity(communityId)

// Graph queries
useGetGraphInCommunity(communityId)
useGetGraphProposalsInCommunity(communityId)
useGetNodeProposalsInCommunity(communityId)
useGetEdgeProposalsInCommunity(communityId)

// Post queries
useGetPostsInCommunity(communityId)
useSearchPostByTitle(communityId, title)

// Comment queries
useGetCommentsInPost(postId)
useGetRepliesToComment(commentId)

// Search
useQueryKnowledgeGraph(communityId, question)
```

### Mutation Hooks (for writing data)

```typescript
// User mutations
useSignUpUser()
useUpdateUser()
useDeleteUser()

// Community mutations
useJoinCommunity()
useLeaveCommunity()
useCreateCommunity()
useUpdateCommunity()
useDeleteCommunity()

// Graph mutations
useCreateNodeProposal()
useCreateEdgeProposal()
useVoteNodeProposal()
useVoteEdgeProposal()

// Post mutations
useCreatePost()
useUpdatePost()
useDeletePost()

// Comment mutations
useCreateComment()
useUpdateComment()
useDeleteComment()
useVoteComment()
```

## Debugging Tips

### Enable React Query DevTools

Already enabled in `src/main.tsx`. In dev mode, click the React Query button in bottom-right corner.

### Check Cache Status

```typescript
function MyComponent() {
  const { data, status, fetchStatus } = useGetCommunityById(id);
  
  console.log({
    status,       // 'idle' | 'pending' | 'success' | 'error'
    fetchStatus,  // 'idle' | 'fetching' | 'paused'
    isFetching: isFetching,  // true while in background refetch
    isFetched: isFetched,    // true if has been fetched once
  });
}
```

### Force Refetch

```typescript
function MyComponent() {
  const { data, refetch } = useGetCommunityById(id);
  
  return (
    <>
      {data}
      <button onClick={() => refetch()}>Refresh Data</button>
    </>
  );
}
```

## Completion Checklist

When migrating a component:

- [ ] Replace useApi imports with React Query hooks
- [ ] Update loading state name (loading → isLoading)  
- [ ] Remove manual useEffect fetching
- [ ] Update error handling
- [ ] Replace mutation callApi with mutateAsync
- [ ] Test caching works (data persists on navigation)
- [ ] Test mutations invalidate cache
- [ ] Test refetching with button
- [ ] Check DevTools for any unexpected behavior

Now your component has automatic caching, smart refetching, and request deduplication! 🎉
