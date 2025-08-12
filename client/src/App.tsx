import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Projects from "@/pages/projects";
import Drawings from "@/pages/drawings";
import Takeoffs from "@/pages/takeoffs";
import SignTypes from "@/pages/sign-types";
import Signs from "@/pages/signs";
import Vendors from "@/pages/vendors";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import ProjectOverview from "@/pages/project-overview";
import SignDetail from "@/pages/sign-detail";
import ProofViewer from "@/pages/proof-viewer";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Switch>
          <Route path="/" component={Projects} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectOverview} />
          <Route path="/drawings" component={Drawings} />
          <Route path="/takeoffs" component={Takeoffs} />
          <Route path="/sign-types" component={SignTypes} />
          <Route path="/signs" component={Signs} />
          <Route path="/signs/:id" component={SignDetail} />
          <Route path="/vendors" component={Vendors} />
          <Route path="/login" component={Login} />
          <Route path="/proof-viewer" component={ProofViewer} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}