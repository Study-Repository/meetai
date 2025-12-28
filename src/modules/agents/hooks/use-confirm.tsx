import { useState } from 'react';

import { ResponsiveDialog } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description: string;
}

export const useConfirm = ({ title, description }: Props) => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>();

  const onConfirm = () => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <ResponsiveDialog
        title={title}
        description={description}
        open={!!promise}
        onOpenChange={handleClose}
      >
        <div className="flex w-full flex-col-reverse items-center justify-end gap-x-2 gap-y-2 pt-4 lg:flex-row">
          <Button
            className="w-full lg:w-auto"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="w-full lg:w-auto"
            variant="destructive"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </ResponsiveDialog>
    );
  };

  return [ConfirmationDialog, onConfirm];
};
