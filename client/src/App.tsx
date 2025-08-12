import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper components to handle route parameters
const ProjectOverviewWrapper = ({ params }: { params: { id: string } }) => (
  <ProjectOverview projectId={params.id} />
);

const SignDetailWrapper = ({ params }: { params: { id: string } }) => (
  <SignDetail signId={params.id} />
);

const DrawingsWrapper = () => <Drawings projectId="all" />;
const TakeoffsWrapper = () => <Takeoffs projectId="all" />;
const SignTypesWrapper = () => <SignTypes projectId="all" />;
const SignsWrapper = () => <Signs projectId="all" />;
const VendorsWrapper = () => <Vendors projectId="all" />;
const ProofViewerWrapper = () => <ProofViewer projectId="all" />;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/proof-viewer" component={ProofViewerWrapper} />
          <Route path="/">
            <MainLayout>
              <Switch>
                <Route path="/" component={Projects} />
                <Route path="/projects" component={Projects} />
                <Route path="/projects/:id" component={ProjectOverviewWrapper} />
                <Route path="/drawings" component={DrawingsWrapper} />
                <Route path="/takeoffs" component={TakeoffsWrapper} />
                <Route path="/sign-types" component={SignTypesWrapper} />
                <Route path="/signs" component={SignsWrapper} />
                <Route path="/signs/:id" component={SignDetailWrapper} />
                <Route path="/vendors" component={VendorsWrapper} />
                <Route component={NotFound} />
              </Switch>
            </MainLayout>
          </Route>
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}