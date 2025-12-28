'use client';

import { ResponsiveDialog } from '@/components/responsive-dialog';

import { AgentGetOne } from '../../types';

import { AgentForm } from './agent-form';

interface Props {
  initialValues: AgentGetOne;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateAgentDialog = ({
  initialValues,
  open,
  onOpenChange,
}: Props) => {
  return (
    <ResponsiveDialog
      title="Edit Agent"
      description="Edit the agent details"
      open={open}
      onOpenChange={onOpenChange}
    >
      <AgentForm
        initialValues={initialValues}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};
