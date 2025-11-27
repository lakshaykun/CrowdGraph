import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signUpUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Trim whitespace
    const username = formData.username.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!username) {
      toast.error("Please enter a username");
      return false;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return false;
    }

    if (username.length > 20) {
      toast.error("Username must be less than 20 characters");
      return false;
    }

    if (!password) {
      toast.error("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const username = formData.username.trim();
      const password = formData.password.trim();

      const response = await signUpUser(username, password);

      if (response?.success) {
        toast.success("Account created successfully! Logging you in...");
        
        // Extract user data from signup response
        const user = response.data;
        
        if (user && user.id) {
          const userData = {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            reputation: user.reputation || 0,
          };
          
          // Automatically log the user in
          login(userData);
          
          // Reset form
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
          });
          
          // Navigate to communities after a short delay
          setTimeout(() => {
            navigate("/communities");
          }, 1000);
        } else {
          toast.error("Account created but unable to log in. Please log in manually.");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      } else {
        const errorMessage = response?.error || response?.message || "Signup failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "An error occurred during signup. Please try again.";
      
      if (error?.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : "Signup failed. Please try again.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 409) {
        errorMessage = "Username already exists. Please choose a different username.";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
            Sign up for CrowdGraph
          </h2>

          {/* Username */}
          <div className="flex w-full sm:w-5/6 md:w-2/3 flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-foreground text-sm sm:text-base font-medium leading-normal pb-2">
                Username
              </p>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-0 border border-border bg-muted focus:border-border h-14 placeholder:text-muted-foreground p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>

          {/* Confirm Password */}
          <div className="flex w-full sm:w-5/6 md:w-2/3 flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-foreground text-sm sm:text-base font-medium leading-normal pb-2">
                Confirm Password
              </p>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
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
                {isLoading ? "Creating Account..." : "Sign Up"}
              </span>
            </button>
          </div>

          <p className="text-muted-foreground text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;




