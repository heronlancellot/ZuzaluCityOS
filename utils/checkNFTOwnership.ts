import { Address } from 'viem';
import { client } from '@/context/WalletContext';

export const checkNFTOwnership = async (
  address: string,
  contractAddress: string,
) => {
  try {
    const balance = (await client.readContract({
      address: contractAddress as Address,
      abi: [
        {
          inputs: [{ name: 'owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [address as Address],
    })) as bigint;

    return balance > 0n;
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return false;
  }
};
