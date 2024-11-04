/* eslint-disable no-unused-vars */
import { GiveBadgeStepAddress } from '@/app/spaces/[spaceid]/trustful/components/GiveBadge';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useEffect,
} from 'react';
import { Address } from 'viem';
import { useAccount, useSwitchChain } from 'wagmi';
import { scroll, scrollSepolia } from 'viem/chains';
import {
  isDev,
  Role,
  TRUSTFUL_SCHEMAS,
} from '@/app/spaces/[spaceid]/trustful/constants/constants';
import { getAllAttestationTitles } from '@/app/spaces/[spaceid]/trustful/service';
import { EthereumAddress } from '@/app/spaces/[spaceid]/trustful/utils/types';
import toast from 'react-hot-toast';

interface User {
  address: Address;
  role: Role;
}

interface Schema {
  index: string;
  id: string;
}

enum BadgeStatus {
  DEFAULT = 'Default',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REJECTED = 'Rejected',
}

interface Badge {
  id: string;
  title: string;
  status: BadgeStatus;
  comment?: string;
  timeCreated: number;
  attester: string;
  recipient: string;
  txid: string;
  schema: Schema;
  revoked: boolean;
  responseId?: string;
}

interface TrustfulContextType {
  setUserRole: Dispatch<SetStateAction<User | null>>;
  userRole: User | null;

  /**BadgeContext */
  selectedBadge: Badge | null;
  setSelectedBadge: Dispatch<SetStateAction<Badge | null>>;

  /**GiveBadgeContext */
  badgeInputAddress: null | EthereumAddress; // TODO: Allowing EthereumAddress here also, Check this after
  setBadgeInputAddress: Dispatch<SetStateAction<null | EthereumAddress>>;
  addressStep: GiveBadgeStepAddress;
  setAddressStep: Dispatch<SetStateAction<GiveBadgeStepAddress>>;
  inputBadgeTitleList: string[] | null;
  setInputBadgeTitleList: Dispatch<SetStateAction<string[] | null>>;
  newTitleAdded: boolean;
  setNewTitleAdded: Dispatch<SetStateAction<boolean>>;
}

const defaultContextValue: TrustfulContextType = {
  userRole: null,
  setUserRole: () => {},

  /**BadgeContext */
  selectedBadge: null,
  setSelectedBadge: () => {},

  /**GiveBadgeContext */
  badgeInputAddress: null,
  setBadgeInputAddress: () => {},
  addressStep: GiveBadgeStepAddress.INSERT_ADDRESS,
  setAddressStep: () => {},
  inputBadgeTitleList: null,
  setInputBadgeTitleList: () => {},
  newTitleAdded: false,
  setNewTitleAdded: () => {},
};

const TrustfulContext = createContext<TrustfulContextType>(defaultContextValue);

interface TrustfulContextProviderProps {
  children: ReactNode;
}

export const TrustfulContextProvider: React.FC<
  TrustfulContextProviderProps
> = ({ children }) => {
  const [userRole, setUserRole] = useState<User | null>(null);

  /**BadgeContext */
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  /**GiveBadgeContext */
  const [badgeInputAddress, setBadgeInputAddress] =
    useState<null | EthereumAddress>(null);
  const [addressStep, setAddressStep] = useState<GiveBadgeStepAddress>(
    GiveBadgeStepAddress.INSERT_ADDRESS,
  );
  const [inputBadgeTitleList, setInputBadgeTitleList] = useState<
    string[] | null
  >(null);
  const [newTitleAdded, setNewTitleAdded] = useState<boolean>(false);

  const TrustfulContextData = useMemo(
    () => ({
      userRole,
      setUserRole,
      selectedBadge,
      setSelectedBadge,
      badgeInputAddress,
      setBadgeInputAddress,
      addressStep,
      setAddressStep,
      inputBadgeTitleList,
      setInputBadgeTitleList,
      newTitleAdded,
      setNewTitleAdded,
    }),
    [
      userRole,
      selectedBadge,
      badgeInputAddress,
      addressStep,
      inputBadgeTitleList,
      newTitleAdded,
    ],
  );

  const { switchChain } = useSwitchChain();
  const { chainId, address } = useAccount();

  useEffect(() => {
    if (address) {
      handleBadgeDropdown();
    }
  }, [address, newTitleAdded, addressStep]);

  const handleBadgeDropdown = async () => {
    if (!address) {
      toast.error('No account connected. Please connect your wallet.');
      return;
    }

    if (isDev ? chainId !== scrollSepolia.id : chainId !== scroll.id) {
      toast.error(
        `Unsupported network. Please switch to the ${isDev ? 'Scroll Sepolia' : 'Scroll'} network.`,
      );
      switchChain({ chainId: isDev ? scrollSepolia.id : scroll.id });
      return;
    }

    const filteredBadges: string[] | Error = await getAllAttestationTitles();

    console.log('filteredBadges', filteredBadges);
    if (filteredBadges instanceof Error || !filteredBadges) {
      toast.error(
        'Error Read Contract.Error while reading badge titles from the blockchain.',
      );
      return;
    }

    if (userRole?.role === Role.ROOT || userRole?.role === Role.MANAGER) {
      filteredBadges.push('Manager');
    }

    if (userRole?.address === TRUSTFUL_SCHEMAS.ATTEST_VILLAGER.allowedRole[0]) {
      filteredBadges.push('Check-in');
      filteredBadges.push('Check-out');
    }

    await Promise.all(filteredBadges);
    console.log('filteredBadges2', filteredBadges);

    setInputBadgeTitleList(filteredBadges.sort());
  };

  return (
    <TrustfulContext.Provider value={TrustfulContextData}>
      {children}
    </TrustfulContext.Provider>
  );
};

export const useTrustful = (): TrustfulContextType => {
  const context = useContext(TrustfulContext);
  if (context === undefined) {
    throw new Error('useTrustful must be used within a TrustfulContext');
  }
  return context;
};
