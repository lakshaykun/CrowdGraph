import React, { useState } from "react";

interface CreditsDisplayProps {
  credits?: number;
  isLoading?: boolean;
  error?: string | null | Error;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  credits,
  isLoading = false,
  error = null,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div className="px-2 sm:px-4 py-2">
      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
        {/* Left: Credits Label and Icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              className="text-primary"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M215.39,88.69l-51.05-51a20,20,0,0,0-28.27,0L55.05,117.72A20,20,0,0,0,51,135.5V200a20,20,0,0,0,20,20h64.5a20,20,0,0,0,17.75-10.06l80-120a20,20,0,0,0,0-22.25Zm-59.3,60.16-28,42L76,160.07,140,96ZM203,136.09,139,212H71V135.5l64-96,68,68Z"></path>
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Your Credits
            </span>
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              ) : error ? (
                <span className="text-xs sm:text-sm text-destructive font-medium">
                  Unable to load
                </span>
              ) : (
                <>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {credits || 0}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                    credits
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info Icon with Tooltip */}
        <div className="relative group cursor-help">
          <button
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            className="p-1 rounded hover:bg-primary/10 transition-colors"
            aria-label="Credits info"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              className="text-muted-foreground hover:text-primary transition-colors"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm-8-80h16a8,8,0,0,1,0,16h-16a8,8,0,0,1,0-16Zm20-56a20,20,0,1,1-20-20A20,20,0,0,1,140,76Z"></path>
            </svg>
          </button>
          {/* Tooltip */}
          <div className={`absolute bottom-full right-0 mb-2 w-48 p-3 bg-card border border-border rounded-lg shadow-lg z-50 text-sm text-foreground pointer-events-auto transition-opacity ${
            isTooltipOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } group-hover:opacity-100 group-hover:pointer-events-auto`}>
            <p className="text-xs text-muted-foreground">
              Credits are earned through contributions and voting in this community and updated every week. Use them to propose and vote on knowledge graph improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsDisplay;
