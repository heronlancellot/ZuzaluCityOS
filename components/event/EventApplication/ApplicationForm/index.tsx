import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  Typography,
  Radio,
  FormControlLabel,
  RadioGroup,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  CircularProgress,
} from '@mui/material';
import { Event } from '@/types';
import {
  ArrowDownIcon,
  ArrowDownSquare,
  RightArrowIcon,
} from '@/components/icons';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';

interface ApplicationFormProps {
  setIsApplicationStep: React.Dispatch<React.SetStateAction<boolean>>;
  event: Event;
  handleClose: () => void;
  setIsApplicationSubmitStep: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormData {
  name: string;
  email: string;
  reason: string;
}

interface QuestionItem {
  question: string;
  type: string;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  setIsApplicationStep,
  event,
  handleClose,
  setIsApplicationSubmitStep,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    reason: '',
  });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplicationStep(true);
  };

  const handleTicketChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTicket(event.target.value);
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Stack
      padding={2.5}
      spacing={2.5}
      border="1px solid #383838"
      bgcolor="#262626"
      height="auto"
    >
      <Stack spacing={1.25}>
        <Typography fontSize="20px" fontWeight={700}>
          Submit Application
        </Typography>
        <Typography fontSize="14px" fontWeight={600}>
          Fill out the below form to submit to the event for approval{' '}
        </Typography>
      </Stack>
      <Stack
        padding={2.5}
        spacing={2.5}
        height="auto"
        border="1px solid #383838"
        bgcolor="rgba(255, 255, 255, 0.02)"
        borderRadius="10px"
      >
        <Stack spacing={1.25}>
          <Typography fontSize="16px" fontWeight={700}>
            You are selecting:
          </Typography>
          <Accordion sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon sx={{ color: 'white' }} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography fontSize="14px" fontWeight={600}>
                {selectedTicket || 'Click to expand to view tickets'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                sx={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: 2,
                }}
                value={selectedTicket}
                onChange={handleTicketChange}
              >
                {event.regAndAccess.edges[0].node.scrollPassTickets?.map(
                  (contract, index) => (
                    <FormControlLabel
                      key={index}
                      value={contract.name}
                      control={<Radio />}
                      sx={{ marginBottom: 2 }}
                      label={
                        <Stack>
                          <Typography fontSize="14px" fontWeight={600}>
                            {contract.name}
                          </Typography>
                          <Typography fontSize="12px">
                            Description: {contract.description}
                          </Typography>
                          <Typography fontSize="12px">
                            Price: {contract.price} {contract.tokenType}
                          </Typography>
                        </Stack>
                      }
                    />
                  ),
                )}
              </RadioGroup>
            </AccordionDetails>
          </Accordion>
          <Stack spacing={1.25}>
            <Stack
              spacing={2}
              sx={{
                width: '100%',
                paddingTop: 1.25,
                paddingBottom: 2.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            >
              <Stack spacing={1.25}>
                <Typography fontSize={16} fontWeight={700} color="white">
                  Receiving Address
                </Typography>
                <Typography
                  fontSize={14}
                  fontWeight={500}
                  color="white"
                  sx={{ opacity: 0.8 }}
                >
                  This will be the address that the ticket is assigned to
                </Typography>
              </Stack>
              <Stack spacing={1.25}>
                <Typography
                  fontSize={16}
                  fontWeight={400}
                  color="white"
                  sx={{ opacity: 0.8 }}
                >
                  Enter an address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Copy and paste your address here"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1.25,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        opacity: 0.5,
                        color: 'white',
                      },
                    },
                  }}
                />
              </Stack>
              <Typography
                fontSize={13}
                fontWeight={400}
                color="#FF9C66"
                sx={{ opacity: 0.8, letterSpacing: 0.13 }}
              >
                Note: Once approved, this address will be used to both create an
                account on Zuzalu.city and to verify in the event to gain access
                to it’s schedule.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {JSON.parse(event.regAndAccess.edges[0].node.applicationForm).map(
            (item: QuestionItem, index: number) => (
              <Stack key={index} spacing={0.5} width="100%" marginBottom={2}>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: '19px',
                    marginBottom: '4px',
                  }}
                >
                  {item.question}
                </Typography>

                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Enter your answer here"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      height: '92px !important',
                      overflow: 'auto',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Stack>
            ),
          )}
        </Stack>
      </Stack>
      <Typography
        sx={{
          width: '100%',
          color: '#FF9C66',
          fontSize: 13,
          fontFamily: 'Inter',
          fontWeight: 400,
          lineHeight: '18.20px',
          letterSpacing: 0.13,
          wordWrap: 'break-word',
          marginBottom: 2,
        }}
      >
        Privacy Reminder: Your address will be seen by the organizer(s) of this
        event and your ticket with this address can be viewed on public
        blockchain. With Zuzalu ZK-enabled passports, your personal address will
        not be seen by validators or anyone else who scans your tickets.
      </Typography>
      <Button
        sx={{
          color: '#67DBFF',
          borderRadius: '10px',
          backgroundColor: 'rgba(103, 219, 255, 0.10)',
          fontSize: '14px',
          padding: '6px 16px',
          border: '1px solid rgba(103, 219, 255, 0.20)',
          flex: 1,
          height: '42px',
        }}
        startIcon={
          !isLoading ? <RightArrowIcon size={5} color="#67DBFF" /> : null
        }
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
      </Button>
    </Stack>
  );
};
