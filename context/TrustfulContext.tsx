/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Address } from 'viem';

export enum Role {
  ROOT = 'ROOT_ROLE',
  MANAGER = 'MANAGER_ROLE',
  VILLAGER = 'VILLAGER_ROLE',
  NO_ROLE = 'NO_ROLE',
}

/** ID of the space enabled for Trustful to appear so far. */
export const CypherHouseSpaceId =
  'kjzl6kcym7w8y5ye1nxcz2o08c8pk9nd57bwqqax6wlfaimn5qsf6s3306jgj34';

interface User {
  address: Address;
  role: Role;
}

interface TrustfulContextType {
  setUserRole: Dispatch<SetStateAction<User | null>>;
  userRole: User | null;
}

const defaultContextValue: TrustfulContextType = {
  userRole: null,
  setUserRole: () => {},
};

const TrustfulContext = createContext<TrustfulContextType>(defaultContextValue);

interface TrustfulContextProviderProps {
  children: ReactNode;
}

export const TrustfulContextProvider: React.FC<
  TrustfulContextProviderProps
> = ({ children }) => {
  const [userRole, setUserRole] = useState<User | null>(null);

  const TrustfulContextData = useMemo(
    () => ({
      userRole,
      setUserRole,
    }),
    [userRole],
  );

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
