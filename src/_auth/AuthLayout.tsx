import Navbar from '../components/shared/Navbar'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth state
  if (isLoading) {
    return null;
  }

  // Redirect to communities if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/communities" replace />;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background text-foreground group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
            <Navbar />
            <section>
                <Outlet />
            </section>
        </div>
    </div>
  )
}

export default AuthLayout



