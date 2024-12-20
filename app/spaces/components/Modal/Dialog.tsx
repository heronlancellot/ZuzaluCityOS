import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useState } from 'react';

interface Proptypes {
  title: string;
  message: React.ReactNode;
  showModal: boolean;
  showActions?: boolean;
  confirmText?: string;
  actions?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: (() => void) | (() => Promise<void>);
  isLoading?: boolean;
}

export default function Dialog({
  showModal,
  onConfirm,
  onClose,
  title,
  message,
  actions,
  showActions = true,
  confirmText = 'Finish',
  isLoading: externalLoading = false,
}: Proptypes) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

  const handleConfirm = async () => {
    if (!onConfirm) return;

    try {
      const result = onConfirm();

      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
      onClose?.();
    } catch (error) {
      console.error('Error in dialog confirmation:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <MDialog
      open={showModal}
      onClose={() => onClose?.()}
      PaperProps={{
        style: {
          width: isMobile ? '90%' : '40%',
          height: 'auto',
          padding: isMobile ? '10px 8px' : '20px 16px',
          backgroundColor: 'rgba(34, 34, 34, 0.9)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: isMobile ? '10px' : '20px',
        },
      }}
    >
      <DialogTitle
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          fontSize: isMobile ? '20px' : '25px',
          fontWeight: 'bold',
        }}
      >
        {title}
        {onClose ? (
          <IconButton
            onClick={onClose}
            style={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              width: isMobile ? '25px' : '30px',
              height: isMobile ? '25px' : '30px',
              borderRadius: '10px',
            }}
          >
            <CloseIcon sx={{ fontSize: isMobile ? 16 : 20 }} />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent style={{ padding: 0, width: '100%', color: 'white' }}>
        <DialogContentText
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: isMobile ? '16px' : '18px',
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        style={{ justifyContent: 'center', width: '100%', padding: 0 }}
      >
        {actions ? (
          actions
        ) : showActions ? (
          <Button
            onClick={handleConfirm}
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ height: '40px' }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              confirmText
            )}
          </Button>
        ) : null}
      </DialogActions>
    </MDialog>
  );
}
