'use client';

import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

import { DashboardCommand } from './dashboard-command';

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [open, setCommandOpen] = useState(false);

  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, []);

  return (
    <>
      <DashboardCommand open={open} onOpenChange={setCommandOpen} />
      <nav className="bg-background flex items-center gap-x-2 border-b px-4 py-3">
        <Button variant="outline" className="size-9" onClick={toggleSidebar}>
          {state === 'collapsed' || isMobile ? (
            <PanelLeftIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>
        <Button
          className="text-muted-foreground hover:text-muted-foreground h-9 w-[240px] justify-start font-normal"
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen((open) => !open)}
        >
          <SearchIcon />
          Search
          <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-sans text-[10px] font-medium select-none">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
