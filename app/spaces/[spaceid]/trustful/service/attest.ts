import { getWalletClient } from '@wagmi/core';
import { Address, encodeFunctionData, type TransactionReceipt } from 'viem';
import {
  sendTransaction,
  estimateGas,
  waitForTransactionReceipt,
} from 'viem/actions';

import { client, config } from '@/context/WalletContext';
import { EAS_CONTRACT_SCROLL } from '../constants/constants';

export interface AttestationRequestData {
  recipient: Address;
  expirationTime: bigint;
  revocable: boolean;
  refUID: Address;
  data: Address;
  value: bigint;
  // attester: Address; // TODO: CHECK IF NEED THIS
  // revocationTime: bigint; // TODO: CHECK IF NEED THIS
}

export interface AttestationRequest {
  schema: Address;
  data: AttestationRequestData;
}

export async function submitAttest(
  from: Address,
  schemaUID: Address,
  attestationRequestData: AttestationRequestData,
): Promise<TransactionReceipt | Error> {
  const walletClient = await getWalletClient(config);
  let gasLimit;

  const AttestationRequest: AttestationRequest = {
    schema: schemaUID,
    data: attestationRequestData,
  };

  const data = encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            components: [
              { internalType: 'bytes32', name: 'uid', type: 'bytes32' },
              { internalType: 'bytes32', name: 'schema', type: 'bytes32' },
              { internalType: 'uint64', name: 'time', type: 'uint64' },
              {
                internalType: 'uint64',
                name: 'expirationTime',
                type: 'uint64',
              },
              {
                internalType: 'uint64',
                name: 'revocationTime',
                type: 'uint64',
              },
              { internalType: 'bytes32', name: 'refUID', type: 'bytes32' },
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'address', name: 'attester', type: 'address' },
              { internalType: 'bool', name: 'revocable', type: 'bool' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            internalType: 'struct Attestation',
            name: 'attestation',
            type: 'tuple',
          },
        ],
        name: 'attest',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'payable',
        type: 'function',
      },
    ],

    args: [AttestationRequest], //TODO: ADJUST THE ARGS HERE
  });

  try {
    gasLimit = await client.estimateGas({
      account: from as Address,
      to: EAS_CONTRACT_SCROLL as Address,
      data: data,
      value: attestationRequestData.value,
    });
  } catch (error) {
    return Error('Error estimating gas.');
  }

  try {
    const transactionHash = await sendTransaction(walletClient, {
      account: from as Address,
      to: EAS_CONTRACT_SCROLL as Address,
      gasLimit: gasLimit,
      data: data,
      value: attestationRequestData.value,
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
