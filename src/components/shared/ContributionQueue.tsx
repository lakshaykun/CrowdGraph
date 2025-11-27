import { useState } from "react";
import type { GraphProposals, NodeProposal, EdgeProposal } from "@/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ContributionCard } from "./ContributionCard";

// Proposal Detail Modal Component
function ProposalDetailModal({
  isOpen,
  onClose,
  proposal,
  onVote,
  graphData = { nodes: [], edges: [] },
}: {
  isOpen: boolean;
  onClose: () => void;
  proposal: NodeProposal | EdgeProposal | null;
  onVote?: (proposalId: string, proposalType: 'node' | 'edge', voteValue: number) => Promise<void>;
  graphData?: { nodes: any[]; edges: any[] };
}) {
  if (!proposal) return null;

  const isNode = 'name' in proposal;
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteValue: number) => {
    if (!onVote) return;
    
    setIsVoting(true);
    try {
      await onVote(proposal.id, isNode ? 'node' : 'edge', voteValue);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[85vh] rounded-xl sm:rounded-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isNode ? (proposal as NodeProposal).name : (proposal as EdgeProposal).type} - Full Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this contribution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Proposal Type</p>
                <p className="text-foreground font-medium">{proposal.proposalType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  proposal.status === 'PENDING' ? 'bg-warning/20 text-warning-foreground' :
                  proposal.status === 'APPROVED' ? 'bg-success/20 text-success' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created At</p>
                <p className="text-foreground font-medium">
                  {new Date(proposal.createdAt).toLocaleDateString()} {new Date(proposal.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Username</p>
                <p className="text-foreground font-medium">{proposal.username || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Node Specific */}
          {isNode && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Node Details</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="text-foreground font-medium">{(proposal as NodeProposal).name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Labels</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(proposal as NodeProposal).labels.map((label, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edge Specific */}
          {!isNode && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Edge Details</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="text-foreground font-medium">{(proposal as EdgeProposal).type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p className="text-foreground font-medium">{graphData.nodes.find((n: any) => n.id === (proposal as EdgeProposal).sourceId)?.name || (proposal as EdgeProposal).sourceId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Target</p>
                  <p className="text-foreground font-medium">{graphData.nodes.find((n: any) => n.id === (proposal as EdgeProposal).targetId)?.name || (proposal as EdgeProposal).targetId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Properties */}
          {proposal.properties && Object.keys(proposal.properties).length > 0 && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Properties</h3>
              
              <div className="space-y-2">
                {Object.entries(proposal.properties).map(([key, value], idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-border pb-2 last:border-0">
                    <p className="text-muted-foreground font-medium">{key}:</p>
                    <p className="text-foreground text-right break-all">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voting Info */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Voting Information</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-muted-foreground text-xs">Upvotes</p>
                  <p className="text-foreground font-semibold">{proposal.upvotes}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-muted-foreground text-xs">Downvotes</p>
                  <p className="text-foreground font-semibold">{proposal.downvotes}</p>
                </div>
              </div>
            </div>

            {/* Vote Buttons */}
            {onVote && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(1)}
                  disabled={isVoting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-success bg-success/10 hover:bg-success/20 border border-success/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{isVoting ? 'Voting...' : 'Upvote'}</span>
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  disabled={isVoting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{isVoting ? 'Voting...' : 'Downvote'}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

// Contribution Queue Section Component
export function ContributionQueueSection({
  proposalsData,
  proposalsLoading,
  onViewMore,
  onVote,
  isCommunityMember = false,
  graphData = { nodes: [], edges: [] },
}: {
  proposalsData: GraphProposals | null;
  proposalsLoading: boolean;
  onViewMore: () => void;
  onVote: (proposalId: string, proposalType: 'node' | 'edge', voteValue: number) => Promise<void>;
  isCommunityMember?: boolean;
  graphData?: { nodes: any[]; edges: any[] };
}) {
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Combine and sort all proposals by date
  const getAllProposalsSortedByDate = () => {
    if (!proposalsData) return [];
    
    const allProposals = [
      ...(proposalsData.nodeProposals || []).map(p => ({ ...p, kind: 'node' as const })),
      ...(proposalsData.edgeProposals || []).map(p => ({ ...p, kind: 'edge' as const }))
    ];
    
    return allProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5); // Only top 5
  };

  const topProposals = getAllProposalsSortedByDate();

  return (
    <>
      <div className="w-full lg:w-[360px] lg:min-w-[360px]">
        <div className="flex items-center justify-between px-4 pb-3 pt-5">
          <h2 className="text-foreground text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Contribution Queue
          </h2>
          {topProposals.length > 0 && (
            <button
              onClick={onViewMore}
              className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View More →
            </button>
          )}
        </div>

        {proposalsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : topProposals.length > 0 ? (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {topProposals.map((proposal: any) => (
              <ContributionCard
                key={`${proposal.kind}-${proposal.id}`}
                proposal={proposal}
                onVote={onVote}
                isCommunityMember={isCommunityMember}
                graphData={graphData}
                onReview={(p) => {
                  setSelectedProposal(p);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              No contributions yet
            </p>
            <p className="text-muted-foreground text-xs text-center mt-1">
              Contributions will appear here for review
            </p>
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      <ProposalDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        proposal={selectedProposal}
        onVote={onVote}
        graphData={graphData}
      />
    </>
  );
}

// Contribution Queue Modal Component
export function ContributionQueueModal({
  isOpen,
  onClose,
  proposalsData,
  proposalsLoading,
  onVote,
  isCommunityMember = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  proposalsData: GraphProposals | null;
  proposalsLoading: boolean;
  onVote: (proposalId: string, proposalType: 'node' | 'edge', voteValue: number) => Promise<void>;
  isCommunityMember?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<'all' | 'node' | 'edge'>('all');
  const [proposalTypeFilter, setProposalTypeFilter] = useState<'all' | 'CREATE' | 'UPDATE' | 'DELETE'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'upvotes' | 'downvotes'>('recent');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Get all proposals with filters and sorting
  const getFilteredProposals = () => {
    if (!proposalsData) return [];
    
    let allProposals = [
      ...(proposalsData.nodeProposals || []).map(p => ({ ...p, kind: 'node' as const })),
      ...(proposalsData.edgeProposals || []).map(p => ({ ...p, kind: 'edge' as const }))
    ];

    // Apply type filter (node/edge)
    if (typeFilter !== 'all') {
      allProposals = allProposals.filter(p => p.kind === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      allProposals = allProposals.filter(p => p.status === statusFilter);
    }

    // Apply proposal type filter (CREATE/UPDATE/DELETE)
    if (proposalTypeFilter !== 'all') {
      allProposals = allProposals.filter(p => p.proposalType === proposalTypeFilter);
    }

    // Apply sorting
    const sorted = [...allProposals].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'downvotes':
          return b.downvotes - a.downvotes;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredProposals = getFilteredProposals();

  const renderProposal = (proposal: any) => {
    return (
      <ContributionCard
        proposal={proposal}
        onVote={onVote}
        isCommunityMember={isCommunityMember}
        onReview={(p) => {
          setSelectedProposal(p);
          setIsDetailOpen(true);
        }}
      />
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] rounded-xl sm:rounded-2xl overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-2xl font-bold">
              Contribution Queue
            </DialogTitle>
            <DialogDescription>
              Review and vote on node and edge proposals for this community
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            {/* Filter Bar with Dropdowns */}
            <div className="bg-linear-to-r from-muted/50 to-muted/20 rounded-xl p-4 border border-border/60 shadow-sm">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Status Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9 text-sm font-medium gap-2 px-3 hover:bg-background/80 transition-colors">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold">{statusFilter === 'all' ? 'All' : statusFilter}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuLabel className="text-sm font-semibold">Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                      <DropdownMenuRadioItem value="all" className="text-sm">All Statuses</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="PENDING" className="text-sm">Pending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="APPROVED" className="text-sm">Approved</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="REJECTED" className="text-sm">Rejected</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Type Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9 text-sm font-medium gap-2 px-3 hover:bg-background/80 transition-colors">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-semibold">{typeFilter === 'all' ? 'All' : typeFilter === 'node' ? 'Nodes' : 'Edges'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuLabel className="text-sm font-semibold">Element Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                      <DropdownMenuRadioItem value="all" className="text-sm">All Types</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="node" className="text-sm">Nodes</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="edge" className="text-sm">Edges</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Proposal Type Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9 text-sm font-medium gap-2 px-3 hover:bg-background/80 transition-colors">
                      <span className="text-muted-foreground">Action:</span>
                      <span className="font-semibold">{proposalTypeFilter === 'all' ? 'All' : proposalTypeFilter}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuLabel className="text-sm font-semibold">Proposal Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={proposalTypeFilter} onValueChange={(v) => setProposalTypeFilter(v as any)}>
                      <DropdownMenuRadioItem value="all" className="text-sm">All Actions</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CREATE" className="text-sm">Create</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="UPDATE" className="text-sm">Update</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="DELETE" className="text-sm">Delete</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9 text-sm font-medium gap-2 px-3 hover:bg-background/80 transition-colors">
                      <span className="text-muted-foreground">Sort:</span>
                      <span className="font-semibold text-xs">
                        {sortBy === 'recent' ? 'Recent' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'upvotes' ? '⬆ Votes' : '⬇ Votes'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel className="text-sm font-semibold">Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <DropdownMenuRadioItem value="recent" className="text-sm">Most Recent</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="oldest" className="text-sm">Oldest First</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="upvotes" className="text-sm">Most Upvotes</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="downvotes" className="text-sm">Most Downvotes</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Results Counter */}
                <div className="text-sm text-muted-foreground font-medium ml-auto px-3 py-1.5 bg-background/50 rounded-lg border border-border/40">
                  <span className="font-semibold text-foreground">{filteredProposals.length}</span> proposal{filteredProposals.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Proposals List */}
            <div className="flex-1 overflow-y-auto pr-2 pl-1">
              {proposalsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredProposals.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredProposals.map((proposal, index) => (
                    <div key={`${proposal.kind}-${proposal.id}-${index}`}>
                      {renderProposal(proposal)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm text-center font-medium">
                    No contributions found
                  </p>
                  <p className="text-muted-foreground text-xs text-center mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal Detail Modal */}
      <ProposalDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        proposal={selectedProposal}
        onVote={onVote}
      />
    </>
  );
}
