import React from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';
import { Event } from '@/types';
interface ApplicationSubmitProps {
  handleClose: () => void;
  event: Event;
  setIsApplicationSubmitStep: React.Dispatch<React.SetStateAction<boolean>>;
  setIsApplicationStep: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormData {
  name: string;
  email: string;
  reason: string;
}

export const ApplicationSubmit: React.FC<ApplicationSubmitProps> = ({
  handleClose,
  event,
  setIsApplicationSubmitStep,
  setIsApplicationStep,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    reason: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplicationSubmitStep(false);
    handleClose();
  };

  return (
    <Stack padding={2.5} spacing={2.5}>
      <Typography variant="h5">{`申请参加 ${event.title}`}</Typography>

      <Stack spacing={2.5}>
        <TextField
          name="name"
          label="姓名"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          name="email"
          label="电子邮箱"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          name="reason"
          label="申请理由"
          multiline
          rows={4}
          value={formData.reason}
          onChange={handleChange}
          fullWidth
        />
      </Stack>

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        提交申请
      </Button>
    </Stack>
  );
};
