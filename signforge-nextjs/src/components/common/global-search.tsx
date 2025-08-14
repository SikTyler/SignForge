'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui-store';
import { useProjectsStore } from '@/lib/store/projects-store';
import { useSignsStore } from '@/lib/store/signs-store';
import { Command } from 'cmdk';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FolderOpen, MapPin, Search, X } from 'lucide-react';

export function GlobalSearch() {
  const router = useRouter();
  const { cmdkOpen, setCmdkOpen } = useUIStore();
  const { projects } = useProjectsStore();
  const { signTypes } = useSignsStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdkOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setCmdkOpen]);

  const handleSelect = (value: string) => {
    setCmdkOpen(false);
    setSearch('');
    router.push(value);
  };

  return (
    <Dialog open={cmdkOpen} onOpenChange={setCmdkOpen}>
      <DialogContent className="p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search projects, signs, and more..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCmdkOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-1">
            <Command.Empty>No results found.</Command.Empty>
            
            <Command.Group heading="Projects">
              {projects
                .filter(project => 
                  project.name.toLowerCase().includes(search.toLowerCase()) ||
                  project.clientName?.toLowerCase().includes(search.toLowerCase())
                )
                .map(project => (
                  <Command.Item
                    key={project.id}
                    value={`/app/projects/${project.id}`}
                    onSelect={handleSelect}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.clientName}
                      </div>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>

            <Command.Group heading="Sign Types">
              {signTypes
                .filter(signType => 
                  signType.name.toLowerCase().includes(search.toLowerCase()) ||
                  signType.code.toLowerCase().includes(search.toLowerCase())
                )
                .map(signType => (
                  <Command.Item
                    key={signType.id}
                    value={`/app/projects/${signType.projectId}/signs`}
                    onSelect={handleSelect}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">{signType.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {signType.code}
                      </div>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
