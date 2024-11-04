import { getWalletClient } from '@wagmi/core';
import { encodeFunctionData, type TransactionReceipt } from 'viem';
import {
  sendTransaction,
  estimateGas,
  waitForTransactionReceipt,
} from 'viem/actions';

import { client, config } from '@/context/WalletContext';
import { RESOLVER_CONTRACT_SCROLL_TRUSTFUL } from '../constants/constants';

export async function setSchema({
  from,
  uid,
  action,
  msgValue,
}: {
  from: `0x${string}`;
  uid: `0x${string}`;
  action: number;
  msgValue: bigint;
}): Promise<TransactionReceipt | Error> {
  const actionAsBigInt = BigInt(action);
  const walletClient = await getWalletClient(config);
  let gasLimit;

  const data = encodeFunctionData({
    abi: [
      {
        inputs: [
          { internalType: 'bytes32', name: 'uid', type: 'bytes32' },
          { internalType: 'uint256', name: 'action', type: 'uint256' },
        ],
        name: 'setSchema',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    args: [uid, actionAsBigInt],
  });

  try {
    gasLimit = client.estimateGas({
      account: from as `0x${string}`,
      to: RESOLVER_CONTRACT_SCROLL_TRUSTFUL as `0x${string}`,
      data: data,
      value: msgValue,
    });
  } catch (error) {
    return Error('Error estimating gas.');
  }

  try {
    const transactionHash = await sendTransaction(walletClient, {
      account: from as `0x${string}`,
      to: RESOLVER_CONTRACT_SCROLL_TRUSTFUL as `0x${string}`,
      gasLimit: gasLimit,
      data: data,
      value: msgValue,
      chain: walletClient.chain,
    });

    const transactionReceipt: TransactionReceipt =
      await client.waitForTransactionReceipt({
        hash: transactionHash,
      });

    return transactionReceipt;
  } catch (error) {
    return Error('Error sending transaction.');
  }
}
