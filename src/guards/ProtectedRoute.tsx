import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuardLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <span className="sr-only">جاري التحقق من الجلسة...</span>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
