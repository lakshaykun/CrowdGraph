import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/apiHook";
import { getCommunitiesOfUser, getUserById, updateUser, deleteUser } from "@/services/api";
import type { Community, User } from "@/schema";

function Profile() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "theme">("overview");
  const { logout } = useAuth();

  // Determine if we're viewing another user's profile or our own
  const isOwnProfile = !userId;
  const profileUserId = userId || currentUser?.id;

  // API hooks
  const { data: profileUser, loading: userLoading, error: userError, callApi: fetchUser } = useApi<User>(getUserById);
  const { data: communities, loading: communitiesLoading, callApi: fetchCommunities } = useApi(getCommunitiesOfUser);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Redirect to /profile if userId matches current user
  useEffect(() => {
    if (userId && currentUser?.id && userId === currentUser.id) {
      navigate("/profile", { replace: true });
    }
  }, [userId, currentUser?.id, navigate]);

  // Fetch user data if viewing another user's profile
  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      fetchUser(userId);
    }
  }, [userId, currentUser?.id]);

  // Fetch communities for the user being viewed
  useEffect(() => {
    if (profileUserId) {
      fetchCommunities(profileUserId);
    }
  }, [profileUserId, fetchCommunities]);

  if (!currentUser) return null;

  // Determine which user to display
  const displayUser = userId ? profileUser : currentUser;

  // Loading state for non-own profiles
  if (!isOwnProfile && userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Error state for non-own profiles
  if (!isOwnProfile && (userError || !profileUser)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/communities"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  const tabs = isOwnProfile
    ? [
        { key: "overview", label: "Overview" },
        { key: "settings", label: "Settings" },
        { key: "theme", label: "Theme" },
      ]
    : [{ key: "overview", label: "Overview" }];

  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-10 lg:px-40 py-8">
      <div className="flex flex-col w-full max-w-[960px] gap-6">
        {/* Profile Header */}
        <div className="flex items-center p-4 @container">
          <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
            <div className="flex gap-4">
              <div className="bg-linear-to-br from-primary to-accent rounded-full min-h-24 w-24 sm:min-h-32 sm:w-32 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg">
                {displayUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-foreground text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  {displayUser?.username.toUpperCase()}
                </p>
                <p className="text-muted-foreground text-sm sm:text-base font-normal leading-normal">
                  Joined {new Date(displayUser?.createdAt || "").toLocaleDateString()}
                </p>
                {displayUser?.reputation !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-foreground font-bold text-lg">
                      {displayUser.reputation || 0}
                    </span>
                    <span className="text-muted-foreground text-sm">Reputation</span>
                  </div>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div className="flex gap-3">
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md h-fit self-center"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - Only show for own profile */}
        {isOwnProfile && (
          <div className="flex border-b border-border gap-6 px-2 sm:px-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "overview" | "settings" | "theme")}
                className={`pb-3 pt-4 font-bold text-sm border-b-[3px] transition ${
                  activeTab === tab.key
                    ? "border-b-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === "overview" && (
            <Overview 
              communities={communities || []}
              loading={communitiesLoading}
              username={displayUser?.username || "User"}
            />
          )}
          {activeTab === "settings" && isOwnProfile && (
            <Settings user={displayUser} />
          )}
          {activeTab === "theme" && isOwnProfile && (
            <ThemeSettings />
          )}
        </div>
      </div>
    </div>
  );
}

const Overview = ({ 
  communities, 
  loading,
  username 
}: { 
  communities: Community[];
  loading: boolean;
  username: string;
}) => {
  const [filter, setFilter] = useState<"Owner" | "Member" | "All">("All");

  const roles = ["All", "Owner", "Member"] as const;
  const filtered = filter === "All" ? communities : communities.filter(c => c.role === filter.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Communities Section */}
      <div className="px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-foreground text-xl sm:text-[22px] font-bold">Communities</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  filter === role
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-muted rounded-lg border-2 border-dashed border-border">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/60 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-muted-foreground text-sm sm:text-base font-medium">
              {username} hasn't joined any communities yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((community) => (
              <Link 
                key={community.id} 
                to={`/community/${community.id}`}
                className="block"
              >
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-foreground font-semibold text-base sm:text-lg flex-1">{community.title}</h3>
                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                      community.role === "Owner"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {community.role || "Member"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{community.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Settings = ({ user }: { user: any }) => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({ username: user?.username || "", password: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setSaveMessage({ type: "error", text: "Username cannot be empty" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await updateUser(user?.id, formData.username, formData.password);
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
      // Clear password field after successful save
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(user?.id);
      // Logout after successful deletion (logout handles navigation to /login)
      logout();
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to delete account. Please try again." });
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-foreground text-xl sm:text-2xl font-bold pb-3">
        Account Settings
      </h2>
      <p className="text-muted-foreground text-sm pb-4">
        Manage your account information.
      </p>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Account</h3>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              New Password (leave empty to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              saveMessage.type === "success"
                ? "bg-green-500/20 text-green-700 border border-green-500/30"
                : "bg-destructive/20 text-destructive border border-destructive/30"
            }`}>
              {saveMessage.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="space-y-4 pt-4 border-t border-destructive/30">
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="w-full px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>

          {/* Delete Confirmation Dialog */}
          {isDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-card border border-border rounded-lg shadow-lg max-w-sm w-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Delete Account?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This action cannot be undone. Your account and all associated data will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsDeleteOpen(false)}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete Permanently"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ThemeSettings = () => {
  const { setTheme, colorFamily, mode } = useTheme();

  const colorThemes = [
    {
      color: "purple",
      label: "Purple",
      primary: "#9333ea",
      secondary: "#c084fc",
      accent: "#a855f7",
    },
    {
      color: "blue",
      label: "Blue",
      primary: "#0ea5e9",
      secondary: "#0c4a6e",
      accent: "#06b6d4",
    },
    {
      color: "gray",
      label: "Gray Stone",
      primary: "#4B5563",
      secondary: "#6B7280",
      accent: "#7F8287",
    },
    {
      color: "pink",
      label: "Pink/Orange",
      primary: "#ec4899",
      secondary: "#be185d",
      accent: "#f472b6",
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-foreground text-xl sm:text-2xl font-bold pb-3">
        Theme Settings
      </h2>
      <p className="text-muted-foreground text-sm pb-4">
        Choose your preferred color theme and appearance mode.
      </p>

      <div className="space-y-6">
        {/* Color Theme Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Color Theme</h3>
          <p className="text-sm text-muted-foreground">
            Select a color theme that matches your preference. You can also toggle between light and dark mode using the button in the navbar.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colorThemes.map((theme) => {
              const isActive = colorFamily === theme.color;

              return (
                <button
                  key={theme.color}
                  onClick={() => setTheme(`${theme.color}-${mode}`)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-primary shadow-lg scale-105 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  {/* Theme Preview */}
                  <div className="flex gap-1 mb-3 justify-center">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>

                  {/* Theme Icon & Name */}
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-semibold text-foreground">
                      {theme.label}
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground">Display Mode</h3>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Current mode:</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
              {mode === "light" ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Light
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark
                </>
              )}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Use the navbar toggle to switch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
