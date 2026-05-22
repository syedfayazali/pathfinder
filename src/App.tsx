import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DbStatusProvider } from "@/hooks/useDbStatus";
import { ToastProvider } from "@/components/ui/toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Applications } from "@/pages/Applications";
import { Pipeline } from "@/pages/Pipeline";
import { Companies } from "@/pages/Companies";
import { Contacts } from "@/pages/Contacts";
import { Documents } from "@/pages/Documents";
import { Settings } from "@/pages/Settings";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <DbStatusProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="companies" element={<Companies />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DbStatusProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ProtectedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
