'use client';

import { type FC } from 'react';
import { Divider, HStack, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { TrustfulIcon } from '@/components/icons';

export const TheHeader: FC = () => {
  // const { isMobile } = useWindowSize();
  const { isConnected } = useAccount();
  const router = useRouter();
  return (
    <>
      <HStack as="header" justifyContent={'space-between'}>
        <HStack
          className="cursor-pointer"
          onClick={() => {
            router.push('/');
          }}
        >
          <TrustfulIcon />
          <Heading
            as="h1"
            fontSize={'1.5rem'}
            className="text-shadow"
            color="white"
          >
            Trustful
          </Heading>
        </HStack>
        <HStack>
          {/* {!isMobile && !isConnected && <ConnectButton label="Connect" />} */}
          {/* {isConnected && <TheHeaderMenu />} */}
        </HStack>
      </HStack>
      <Divider className="border-slate-50 opacity-10" />
    </>
  );
};
