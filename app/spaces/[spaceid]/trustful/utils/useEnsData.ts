import { useEffect, useState } from 'react';

import { EthereumAddress } from '../utils/types';
// import { publicClientMainnet } from '@/lib/wallet/client'; //CHANGED publicClientMainet to client
import { client } from '@/context/WalletContext';

export enum ENSAvatarQueryStatus {
  LOADING,
  SUCCESS,
  ERROR,
}

interface Props {
  ensAddress: EthereumAddress | null;
}

export const useEnsData = ({ ensAddress }: Props) => {
  const [primaryName, setPrimaryName] = useState<string | null | undefined>(
    undefined,
  );
  const [avatarQueryStatus, setAvatarQueryStatus] =
    useState<ENSAvatarQueryStatus>(ENSAvatarQueryStatus.LOADING);

  const getEnsName = async () => {
    if (!ensAddress) {
      return;
    }

    const name = await client.getEnsName({
      address: ensAddress?.address,
    });

    setPrimaryName(name);
    setAvatarQueryStatus(ENSAvatarQueryStatus.SUCCESS);
  };

  useEffect(() => {
    if (ensAddress) {
      getEnsName();
    }
  }, []);

  return {
    primaryName,
    avatarQueryStatus: avatarQueryStatus,
    avatarSrc: primaryName
      ? `https://metadata.ens.domains/mainnet/avatar/${primaryName}`
      : null,
  };
};
