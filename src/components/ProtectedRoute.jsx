import { Navigate } from "react-router-dom";
import { GitBranch } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center animate-pulse">
          <GitBranch size={22} strokeWidth={2.5} className="text-bg" />
        </span>
        <p className="font-mono text-xs text-ink-faint tracking-wider">
          Loading DevTrack...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
