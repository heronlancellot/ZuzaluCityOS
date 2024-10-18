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
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { createApplicationForm } from '@/services/event/createApplicationForm';

interface ApplicationFormProps {
  setIsApplicationStep: React.Dispatch<React.SetStateAction<boolean>>;
  event: Event;
  handleClose: () => void;
  setIsApplicationSubmitStep: React.Dispatch<React.SetStateAction<boolean>>;
  profileId: string;
}

interface FormData {
  selectedTicket: string;
  address: string;
  [key: string]: string;
}

interface QuestionItem {
  question: string;
  type: string;
}

const schema = yup.object().shape({
  selectedTicket: yup.string().required('Please select a ticket type'),
  address: yup
    .string()
    .required('Please enter your receiving address')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid EVM address'),
});

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  setIsApplicationStep,
  event,
  handleClose,
  profileId,
  setIsApplicationSubmitStep,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  interface JsonDataType {
    'selected ticket': {
      type: string;
      content: string;
    };
    'receiving address': {
      type: string;
      content: string;
    };
    [key: string]: {
      type: string;
      content: string;
    };
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      interface JsonDataItem {
        'selected ticket'?: string;
        'receiving address'?: string;
        answer?: string;
        type: string;
      }

      const jsonData: JsonDataItem[] = [
        {
          'selected ticket': data.selectedTicket,
          type: 'required',
        },
        {
          'receiving address': data.address,
          type: 'required',
        },
      ];

      Object.keys(data).forEach((key) => {
        if (key !== 'selectedTicket' && key !== 'address') {
          jsonData.push({
            answer: data[key],
            type: 'input',
          });
        }
      });
      const response = await createApplicationForm({
        eventId: event.id,
        profileId: profileId,
        answers: JSON.stringify(jsonData),
      });
      console.log(response);
      handleClose();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          Fill out the below form to submit to the event for approval
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
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
                  Click to expand to view ticket types
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup>
                  {event.regAndAccess.edges[0].node.scrollPassTickets?.map(
                    (contract, index) => (
                      <FormControlLabel
                        key={index}
                        value={contract.name}
                        control={<Radio {...register('selectedTicket')} />}
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
            {errors.selectedTicket && (
              <Typography color="error">
                {errors.selectedTicket.message}
              </Typography>
            )}
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
                    This will be the address to assign tickets to
                  </Typography>
                </Stack>
                <Stack spacing={1.25}>
                  <Typography
                    fontSize={16}
                    fontWeight={400}
                    color="white"
                    sx={{ opacity: 0.8 }}
                  >
                    Enter Address
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Copy and paste your address here"
                    variant="outlined"
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
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
                  Note: Once approved, this address will be used to create an
                  account on Zuzalu.city and to verify in the event.
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
                    {...register(`question_${index}`)}
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
            marginTop: 2,
          }}
        >
          Privacy reminder: The organizer of this event will see your address,
          your tickets, and their address on the public blockchain. Using a
          Zuzalu ZK-enabled passport, verifier, or anyone scanning your ticket
          will not be able to see your personal address.
        </Typography>
        <Button
          type="submit"
          sx={{
            color: '#67DBFF',
            borderRadius: '10px',
            backgroundColor: 'rgba(103, 219, 255, 0.10)',
            fontSize: '14px',
            padding: '6px 16px',
            border: '1px solid rgba(103, 219, 255, 0.20)',
            flex: 1,
            height: '42px',
            width: '100%',
          }}
          onClick={handleSubmit(onSubmit)}
          startIcon={
            !isLoading ? <RightArrowIcon size={5} color="#67DBFF" /> : null
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Stack>
  );
};
