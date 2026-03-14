import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { hasModuleAccess } from '@/core/permissions';
import type { Role } from '@/core/types';

interface Props {
  module?: string;
  roles?: Role[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ module, roles, children }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null; // Loading

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (module && !hasModuleAccess(user.role, module)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
