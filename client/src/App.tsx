import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Students = lazy(() => import("@/pages/Students"));
const AddStudent = lazy(() => import("@/pages/AddStudent"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Academics = lazy(() => import("@/pages/Academics"));
const Fees = lazy(() => import("@/pages/Fees"));
const Examinations = lazy(() => import("@/pages/Examinations"));
const Communication = lazy(() => import("@/pages/Communication"));
const Faculty = lazy(() => import("@/pages/Faculty"));
const Timetable = lazy(() => import("@/pages/Timetable"));
const Transport = lazy(() => import("@/pages/Transport"));
const Payroll = lazy(() => import("@/pages/Payroll"));
const LeaveManagement = lazy(() => import("@/pages/LeaveManagement"));
const Reports = lazy(() => import("@/pages/Reports"));
const Tenants = lazy(() => import("@/pages/Tenants"));
const SupportTickets = lazy(() => import("@/pages/SupportTickets"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const Preferences = lazy(() => import("@/pages/Preferences"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/students">
        <ProtectedRoute component={Students} />
      </Route>
      <Route path="/students/add">
        <ProtectedRoute component={AddStudent} />
      </Route>
      <Route path="/attendance">
        <ProtectedRoute component={Attendance} />
      </Route>
      <Route path="/academics">
        <ProtectedRoute component={Academics} />
      </Route>
      <Route path="/fees">
        <ProtectedRoute component={Fees} />
      </Route>
      <Route path="/examinations">
        <ProtectedRoute component={Examinations} />
      </Route>
      <Route path="/communication">
        <ProtectedRoute component={Communication} />
      </Route>
      <Route path="/faculty">
        <ProtectedRoute component={Faculty} />
      </Route>
      <Route path="/timetable">
        <ProtectedRoute component={Timetable} />
      </Route>
      <Route path="/transport">
        <ProtectedRoute component={Transport} />
      </Route>
      <Route path="/payroll">
        <ProtectedRoute component={Payroll} />
      </Route>
      <Route path="/leave-management">
        <ProtectedRoute component={LeaveManagement} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/tenants">
        <ProtectedRoute component={Tenants} />
      </Route>
      <Route path="/support-tickets">
        <ProtectedRoute component={SupportTickets} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfileSettings} />
      </Route>
      <Route path="/preferences">
        <ProtectedRoute component={Preferences} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
