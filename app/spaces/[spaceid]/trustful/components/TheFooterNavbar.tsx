'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import {
  AdminIcon,
  BadgeIcon,
  HeartLoveIcon,
  LoginIcon,
  LogoutIcon,
  QrCodeIcon,
  ThankYouIcon,
} from '@/components/icons';
import { useTrustful } from '@/context/TrustfulContext';
import { Role } from '../constants/constants';
// import { WalletContext } from '@/lib/context/WalletContext';

export const TheFooterNavbar = () => {
  const params = useParams();
  const { push } = useRouter();
  const { userRole } = useTrustful();
  // const { villagerAttestationCount } = useContext(WalletContext);
  const villagerAttestationCount = Number(1);
  const checkInStatus =
    villagerAttestationCount === 0
      ? 'Check In'
      : villagerAttestationCount === 1
        ? 'Check Out'
        : 'Thank You';

  const actualURL = `/spaces/${params.spaceid}/trustful`;

  return (
    <Box
      as="footer"
      textAlign={'center'}
      className="px-6 sm:p-0 bg-[#2d2d2d] w-full flex justify-end group border-t border-[#F5FFFF14] border-opacity-[8]"
    >
      {villagerAttestationCount !== null && (
        <Flex gap={4} className="w-full justify-center">
          {villagerAttestationCount > 0 && (
            <Box
              className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'my-badges' ? 'border-[#B1EF42]' : 'border-transparent'}`}
              onClick={() => push(`${actualURL}/my-badges`)}
            >
              <BadgeIcon
                className={`w-5 h-5 text-white ${params.slug == 'my-badges' ? 'opacity-100' : 'opacity-50'}`}
              />
              <Text
                className={`text-slate-50 ${params.slug == 'my-badges' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
              >
                My badges
              </Text>
            </Box>
          )}
          {villagerAttestationCount > 0 && (
            <Box
              className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'give-badge' ? 'border-[#B1EF42]' : 'border-transparent'}`}
              onClick={() => push(`${actualURL}`)}
            >
              <HeartLoveIcon
                className={`w-5 h-5 text-white ${params.slug == 'give-badge' ? ' opacity-100' : 'opacity-50'}`}
              />
              <Text
                className={`text-slate-50 ${params.slug == 'give-badge' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
              >
                Give badge
              </Text>
            </Box>
          )}
          {villagerAttestationCount > 0 && (
            <Box
              className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'share' ? 'border-[#B1EF42]' : 'border-transparent'}`}
              onClick={() => push(`${actualURL}/share`)}
            >
              <QrCodeIcon
                className={`w-5 h-5 text-white ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'}`}
              />
              <Text
                className={`text-slate-50 ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
              >
                Share
              </Text>
            </Box>
          )}
          {/* <Box
            className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'checkout' || params.slug == 'checkin' ? 'border-[#B1EF42]' : 'border-transparent'}`}
            onClick={() => {
              if (checkInStatus === 'Check In') push(`${actualURL}/checkin`);
              if (
                checkInStatus === 'Check Out' ||
                checkInStatus === 'Thank You'
              )
                push('/checkout');
            }}
          >
            {checkInStatus === 'Check In' ? (
              <LoginIcon
                className={`w-5 h-5 text-white ${params.slug == 'checkin' ? 'opacity-100' : 'opacity-50'}`}
              />
            ) : checkInStatus === 'Check Out' ? (
              <LogoutIcon
                className={`w-5 h-5 text-white ${params.slug == 'checkout' ? 'opacity-100' : 'opacity-50'}`}
              />
            ) : (
              <ThankYouIcon
                className={`w-5 h-5 text-white ${params.slug == 'checkout' ? 'opacity-100' : 'opacity-50'}`}
              />
            )}
            <Text
              className={`text-slate-50 ${params.slug == 'checkout' || params.slug == 'checkin' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
            >
              {checkInStatus}
            </Text>
          </Box> */}
          <Box
            className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'share' ? 'border-[#B1EF42]' : 'border-transparent'}`}
            onClick={() => push(`${actualURL}/events`)}
          >
            <AdminIcon
              className={`w-5 h-5 text-white ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'}`}
            />
            <Text
              className={`text-slate-50 ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
            >
              Events
            </Text>
          </Box>
          <Box
            className={`flex flex-col min-w-16 justify-center items-center cursor-pointer py-3 gap-2 border-t ${params.slug == 'share' ? 'border-[#B1EF42]' : 'border-transparent'}`}
            onClick={() => push(`${actualURL}/admin`)}
          >
            <AdminIcon
              className={`w-5 h-5 text-white ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'}`}
            />
            <Text
              className={`text-slate-50 ${params.slug == 'share' ? 'opacity-100' : 'opacity-50'} text-sm font-medium leading-none`}
            >
              Settings
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  );
};
