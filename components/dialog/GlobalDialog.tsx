import React, { useCallback } from 'react';
import Dialog from '@/app/spaces/components/Modal/Dialog';
import { useDialog } from './DialogContext';

export function GlobalDialog() {
  const { dialogConfig, isOpen, hideDialog } = useDialog();

  const handleClose = useCallback(() => {
    dialogConfig?.onClose?.();
    hideDialog();
  }, [dialogConfig, hideDialog]);

  const handleConfirm = useCallback(() => {
    dialogConfig?.onConfirm?.();
    hideDialog();
  }, [dialogConfig, hideDialog]);

  if (!dialogConfig) return null;

  return (
    <Dialog
      title={dialogConfig.title}
      message={dialogConfig.message}
      showModal={isOpen}
      showActions={dialogConfig.showActions ?? true}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
