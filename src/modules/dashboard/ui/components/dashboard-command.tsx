import { Dispatch, SetStateAction } from 'react';

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from '@/components/ui/command';

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, onOpenChange }: Props) => {
  return (
    <CommandResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Find a meeting or agent..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem>Test</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
