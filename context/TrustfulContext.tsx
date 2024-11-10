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
  CYPHERHOUSE_SPACEID,
  isDev,
  Role,
  ROLES,
  spaceIdValue,
  TRUSTFUL_SCHEMAS,
} from '@/app/spaces/[spaceid]/trustful/constants/constants';
import {
  getAllAttestationTitles,
  getAllEvents,
  getSession,
  getUserRole,
  hasRole,
} from '@/app/spaces/[spaceid]/trustful/service';
import { EthereumAddress } from '@/app/spaces/[spaceid]/trustful/utils/types';
import toast from 'react-hot-toast';
import { getSpace } from '@/app/spaces/[spaceid]/trustful/service/backend/getSpace';

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

export interface Badge {
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

  useEffect(() => {
    const fetchUserRoleByContract = async () => {
      const isRoot = await hasRole(ROLES.ROOT, address as Address);
      if (isRoot) {
        setUserRole({
          address: address as Address,
          role: Role.ROOT,
        });
        return;
      }
      const isManager = await hasRole(ROLES.MANAGER, address as Address);
      if (isManager) {
        setUserRole({
          address: address as Address,
          role: Role.MANAGER,
        });
        return;
      }
      const isVillager = await hasRole(ROLES.VILLAGER, address as Address);
      if (isVillager) {
        setUserRole({
          address: address as Address,
          role: Role.VILLAGER,
        });
        return;
      }
    };

    const fetchUserRole = async () => {
      if (address) {
        try {
          const getUserRoleByEndpoint = await getUserRole(address as Address);
          if (getUserRoleByEndpoint && getUserRoleByEndpoint?.role) {
            setUserRole({
              address: address as Address,
              role: getUserRoleByEndpoint.role,
            });
            return;
          }
        } catch (error) {
          console.error('Failed to fetch user role from endpoint:', error);
          await fetchUserRoleByContract();
        }
      }
    };

    fetchUserRole();
  }, [address, chainId]);

  // host_ + titleSession(Name-Session) + _ + Timestamp

  // nas sessoes que eu sou owner adicionar badge de host e atendee
  // 1. PEGAR Todos os titulos de sessão do backend --> getSession() address - owner host  ( tem que ser host de alguma sessão para ter essa badge especial )
  // 2. Montar badge ( #1 String ( host_ + titleSession(Name-Session)) #2 Badge ( atendee_ + titleSession(Name-Session)) )
  // 3. Adicionar essas 2 strings no filteredBadges.

  // Badge de Host e Atendee se for o owner da Sessão.

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        // TODO: Get all spaces -> armazenar cada spaceId // ja tem só 1
        // TODO: Get all events do space de cada espaco
        // get session passando cada evento e ver se o hostAddress é igual ao address
        const spaces = await getSpace({ userAddress: address as Address });
        console.log('spacesspaces', spaces);
        const spaceIds = spaces && spaces.map((space) => space.spaceId);

        // const eventsData = await getAllEvents({
        //   spaceId: spaceIdValue,
        //   userAddress: address as Address,
        // });

        // if (eventsData) {
        //   eventsData.map((event) => {
        //     event.sessions.forEach((session) => {
        //       console.log(' session ', session);
        //       console.log(' session ', event);
        //       // if (session.hostAddress === address) {
        //       //   console.log('Host of session:', session.name);
        //       //   // Add host badge
        //       //   const hostBadgeTitle = `host_${session.name}`;
        //       //   const attendeeBadgeTitle = `attendee_${session.name}`;
        //       //   setInputBadgeTitleList((prevList) => {
        //       //     const newList = prevList ? [...prevList] : [];
        //       //     newList.push(hostBadgeTitle, attendeeBadgeTitle);
        //       //     return newList;
        //       //   });
        //       // }
        //     });
        //   });
        // }
        console.log('spaceIds', spaceIds);
        if (spaceIds) {
          for (const spaceId of spaceIds) {
            console.log('spaceId', spaceId);
            const events = await getAllEvents({
              spaceId: spaceIdValue,
              userAddress: address as Address,
            });

            console.log('eventsxxxx', events);
            if (events && events.length > 0) {
              events.map(async (event) => {
                const sessions = await getSession({
                  eventid: event.eventId,
                  userAddress: address as Address,
                });
                console.log('sessionssessionssessionssessions', sessions);
                if (sessions) {
                  sessions.sessions.forEach((session) => {
                    console.log(' session44444 ', session.hostAddress);
                    console.log(' lolol ', event);
                    console.log('address', address);
                    if (
                      address &&
                      session.hostAddress &&
                      session.hostAddress.toLowerCase() == address.toLowerCase()
                    ) {
                      console.log('Host of session:', session.name);
                      // Add host badge
                      const hostBadgeTitle = `host_${session.name}`;
                      const attendeeBadgeTitle = `attendee_${session.name}`;
                      setInputBadgeTitleList((prevList) => {
                        const newList = prevList ? [...prevList] : [];
                        newList.push(hostBadgeTitle, attendeeBadgeTitle);
                        return newList;
                      });
                    }
                  });
                }
                console.log('eachevent', event);
                // event.sessions.forEach((session) => {
                //   if (session.hostAddress === address) {
                //     console.log('Host of session:', session.name);
                //     // Add host badge
                //     const hostBadgeTitle = `host_${session.name}`;
                //     const attendeeBadgeTitle = `attendee_${session.name}`;
                //     setInputBadgeTitleList((prevList) => {
                //       const newList = prevList ? [...prevList] : [];
                //       newList.push(hostBadgeTitle, attendeeBadgeTitle);
                //       return newList;
                //     });
                //   }
                // });
              });
            }
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchAllEvents();
  }, [address]);

  // useEffect(() => {
  //   const fetchAllEvents = async () => {
  //     try {
  //       const allEventSessionsData = await getSession({
  //         eventid: Number(eventid),
  //         userAddress: address as Address,
  //       });
  //       console.log('allEventSessionsData', allEventSessionsData);

  //       if (allEventSessionsData && allEventSessionsData.sessions.length > 0) {
  //         const titles = allEventSessionsData.sessions.map(
  //           (session) => session.name,
  //         );
  //         // const newBadge:Badge = {
  //         //   attester
  //         // }
  //         // setSessions([allEventSessionsData]);
  //       }
  //     } catch (error) {
  //       console.log('error', error);
  //     }
  //   };
  //   fetchAllEvents();
  // }, [address]);

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
