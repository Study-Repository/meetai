'use client';

import { ResponsiveDialog } from '@/components/responsive-dialog';

import { MeetingGetOne } from '../../types';

import { MeetingForm } from './meeting-form';

interface Props {
  initialValues: MeetingGetOne;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateMeetingDialog = ({
  initialValues,
  open,
  onOpenChange,
}: Props) => {
  return (
    <ResponsiveDialog
      title="Edit Meeting"
      description="Edit the meeting details"
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        initialValues={initialValues}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};
