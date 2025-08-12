import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Projects from "@/pages/projects";
import ProjectOverview from "@/pages/project-overview";
import SignTypes from "@/pages/sign-types";
import SignDetail from "@/pages/sign-detail";
import Signs from "@/pages/signs";
import ProofViewer from "@/pages/proof-viewer";
import Vendors from "@/pages/vendors";
import Drawings from "@/pages/drawings";
import ProtectedRoute from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </Route>
      <Route path="/projects/:id">
        {(params) => (
          <ProtectedRoute>
            <ProjectOverview projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id/drawings">
        {(params) => (
          <ProtectedRoute>
            <Drawings projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id/sign-types">
        {(params) => (
          <ProtectedRoute>
            <SignTypes projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id/signs">
        {(params) => (
          <ProtectedRoute>
            <Signs projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/signs/:id">
        {(params) => (
          <ProtectedRoute>
            <SignDetail signId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id/proof">
        {(params) => (
          <ProtectedRoute>
            <ProofViewer projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id/vendors">
        {(params) => (
          <ProtectedRoute>
            <Vendors projectId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
