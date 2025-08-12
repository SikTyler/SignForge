import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TopNav } from '@/components/TopNav';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectOverview } from '@/pages/ProjectOverview';
import { ProjectDrawings } from '@/pages/ProjectDrawings';
import { ProjectROM } from '@/pages/ProjectROM';
import { ProjectCode } from '@/pages/ProjectCode';
import { ProjectRFQs } from '@/pages/ProjectRFQs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <TopNav />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectOverview />} />
              <Route path="/projects/:id/drawings" element={<ProjectDrawings />} />
              <Route path="/projects/:id/rom" element={<ProjectROM />} />
              <Route path="/projects/:id/code" element={<ProjectCode />} />
              <Route path="/projects/:id/rfqs" element={<ProjectRFQs />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}