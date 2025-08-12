import { Link, useLocation } from "wouter";
import { 
  ChartPie, 
  FileText, 
  Layers, 
  Tag, 
  Eye, 
  Handshake,
  Upload,
  Calculator,
  FileText as FileTextIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  projectId?: string;
}

export default function Sidebar({ projectId }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: ChartPie,
      current: location === `/projects/${projectId}`,
    },
    {
      name: "Drawing Sets",
      href: `/projects/${projectId}/drawings`,
      icon: FileText,
      current: location === `/projects/${projectId}/drawings`,
    },
    {
      name: "Takeoffs & ROM",
      href: `/projects/${projectId}/takeoffs`,
      icon: Calculator,
      current: location === `/projects/${projectId}/takeoffs`,
    },
    {
      name: "Code Summary",
      href: `/projects/${projectId}/code-summary`,
      icon: FileTextIcon,
      current: location === `/projects/${projectId}/code-summary`,
    },
    {
      name: "Sign Types",
      href: `/projects/${projectId}/sign-types`,
      icon: Layers,
      current: location === `/projects/${projectId}/sign-types`,
    },
    {
      name: "Signs",
      href: `/projects/${projectId}/signs`,
      icon: Tag,
      current: location === `/projects/${projectId}/signs`,
    },
    {
      name: "Digital Proof",
      href: `/projects/${projectId}/proof`,
      icon: Eye,
      current: location === `/projects/${projectId}/proof`,
    },
    {
      name: "Vendors & RFQs",
      href: `/projects/${projectId}/vendors`,
      icon: Handshake,
      current: location === `/projects/${projectId}/vendors`,
    },
  ];

  if (!projectId) {
    return null;
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    item.current
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <Icon
                    className={cn(
                      item.current ? "text-primary-500" : "text-gray-400",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
