import { Stack, Typography } from '@mui/material';
import { ZuButton } from 'components/core';
import { ScrollIcon } from 'components/icons';
import Image from 'next/image';
import React, {
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import TicketCard from '../components/ticketCard';
import { Anchor, ScrollPassTickets } from '@/types';
import VerifyAccess from '../components/verify';

export interface ScrollPassDefaultProps {
  tickets: ScrollPassTickets[];
  applyRule: string;
  setSponsor: Dispatch<SetStateAction<boolean>>;
  setWhitelist: Dispatch<SetStateAction<boolean>>;
  onToggle: (anchor: Anchor, open: boolean) => void;
  handleStep: (step: number) => void;
  setApplication: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScrollPassDefault: React.FC<ScrollPassDefaultProps> = ({
  tickets,
  applyRule,
  setSponsor,
  setWhitelist,
  onToggle,
  handleStep,
  setApplication,
}) => {
  return (
    <Stack
      padding={'24px 20px'}
      border={'1px solid rgba(255, 255, 255, 0.10)'}
      borderRadius={'0px 0px 10px 10px'}
      margin={'0px !important'}
      gap={'20px'}
    >
      <Stack spacing="10px">
        {tickets.map((ticket, index) => (
          <TicketCard
            key={index}
            name={ticket.name}
            price={ticket.price}
            description={ticket.description}
            tokenType={ticket.tokenType}
          />
        ))}
        <Stack spacing={1}>
          <Typography
            sx={{
              color: 'white',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              lineHeight: '22.4px',
              wordWrap: 'break-word',
            }}
          >
            Buy Tickets
          </Typography>
          {applyRule === 'Apply to Purchase' && (
            <Typography
              sx={{
                color: '#FFC77D',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                lineHeight: '20.8px',
                wordWrap: 'break-word',
              }}
            >
              This event requires admin approval
            </Typography>
          )}
        </Stack>
        {applyRule === 'Apply to Purchase' && (
          <ZuButton
            sx={{
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              marginTop: '10px',
              color: '#7DFFD1',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              lineHeight: '19.2px',
              wordWrap: 'break-word',
              textTransform: 'none',
              backgroundColor: 'rgba(125, 255, 209, 0.1)',
            }}
            startIcon={<ArrowCircleRightIcon sx={{ color: '#7DFFD1' }} />}
            onClick={() => {
              setWhitelist(false);
              setApplication(true);
              onToggle('right', true);
            }}
          >
            Apply to Join
          </ZuButton>
        )}
        <Typography
          sx={{
            color: 'white',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            lineHeight: '22.4px',
            wordWrap: 'break-word',
          }}
        >
          Already approved?
        </Typography>
        <ZuButton
          sx={{
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            marginTop: '10px',
            color: '#7DFFD1',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            lineHeight: '19.2px',
            wordWrap: 'break-word',
            textTransform: 'none',
            backgroundColor: 'rgba(125, 255, 209, 0.1)',
          }}
          startIcon={<ArrowCircleRightIcon sx={{ color: '#7DFFD1' }} />}
          onClick={() => {
            setSponsor(false);
            setWhitelist(true);
            onToggle('right', true);
          }}
        >
          Purchase Ticket
        </ZuButton>
      </Stack>
      <VerifyAccess handleStep={handleStep} />
    </Stack>
  );
};

export default ScrollPassDefault;
