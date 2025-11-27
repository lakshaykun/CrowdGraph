import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { signInUser } from "@/services/api";
import { toast } from "sonner";


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setIsLoading(true);

    try {
      // Call the signInUser API to authenticate
      const authResponse = await signInUser(formData.username, formData.password);

      if (authResponse?.success) {
        // Authentication successful - now fetch user data
        try {
          const user = authResponse.data;
          
          if (user) {
            const userData = {
              id: user.id,
              username: user.username,
              createdAt: user.createdAt,
              reputation: user.reputation || 0,
            };
            
            login(userData);
            toast.success(`Welcome back, ${formData.username}!`);
            navigate("/Communities");
          } else {
            toast.error("Unable to fetch user data. Please try again.");
          }
        } catch (userError: any) {
          console.error("Error fetching user data:", userError);
          toast.error("Unable to fetch user data. Please try again.");
        }
      } else {
        toast.error(authResponse?.error || "Login failed. Please check your credentials and try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.error || "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <form
          onSubmit={handleSubmit}
          className="layout-content-container flex justify-center items-center flex-col w-full sm:w-[512px] py-5 max-w-[960px] flex-1"
        >
          <h2 className="text-foreground tracking-light text-xl sm:text-2xl md:text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
            Log in to CrowdGraph
          </h2>

          {/* Email or Username */}
          <div className="flex w-full sm:w-5/6 md:w-2/3 flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-foreground text-sm sm:text-base font-medium leading-normal pb-2">
                Username
              </p>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-0 border border-border bg-muted focus:border-border h-14 placeholder:text-muted-foreground p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>

          {/* Password */}
          <div className="flex w-full sm:w-5/6 md:w-2/3 flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-foreground text-sm sm:text-base font-medium leading-normal pb-2">
                Password
              </p>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-0 border border-border bg-muted focus:border-border h-14 placeholder:text-muted-foreground p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="truncate">
                {isLoading ? "Logging in..." : "Log In"}
              </span>
            </button>
          </div>

          <p className="text-muted-foreground text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;




