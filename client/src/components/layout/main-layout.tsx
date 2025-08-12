import NavBar from "./nav-bar";
import Sidebar from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  projectId?: string;
}

export default function MainLayout({ children, projectId }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex">
        <Sidebar projectId={projectId} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
