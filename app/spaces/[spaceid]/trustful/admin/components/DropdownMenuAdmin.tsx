'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  Card,
  Text,
  Select,
  Flex,
  Button,
  Textarea,
  Box,
} from '@chakra-ui/react';
import { BeatLoader } from 'react-spinners';
import { Address, isAddress } from 'viem';
import { scroll, scrollSepolia } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';
import {
  isDev,
  Role,
  ROLES,
  TRUSTFUL_SCHEMAS,
} from '../../constants/constants';
import { ID_CHECK_IN_QUERY } from '../../constants/schemaQueries';
import {
  grantRole,
  hasRole,
  fetchEASData,
  revoke,
  revokeRole,
  setAttestationTitle,
  setSchema,
} from '@/app/spaces/[spaceid]/trustful/service';
import { EthereumAddress } from '@/app/spaces/[spaceid]/trustful/utils/types';
import { useTrustful } from '@/context/TrustfulContext';
import toast from 'react-hot-toast';
import {
  ADMIN_ACTION,
  ROLES_OPTIONS,
  ADMIN_OPTIONS,
  MANAGER_OPTIONS,
  ACTIONS_OPTIONS,
} from './ui-utils';
import { InputAddressUser } from '../../components/InputAddressUser';

export const DropdownMenuAdmin = () => {
  const { address, chainId } = useAccount();
  const { setNewTitleAdded, userRole } = useTrustful();
  const { switchChain } = useSwitchChain();
  const [role, setRole] = useState<ROLES | null>(null);
  const [inputAddress, setInputAddress] = useState<string>('');
  const [validAddress, setValidAddress] = useState<EthereumAddress | null>(
    null,
  );
  const [adminAction, setAdminAction] = useState<ADMIN_ACTION | null>(null);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [attestationTitleText, setAttestationTitleText] = useState<string>('');
  const [attestationBadgeIsValid, setAttestationBadgeIsValid] =
    useState<boolean>(false);
  const [schemaUID, setSchemaUID] = useState<string | `0x${string}`>('');
  const [action, setAction] = useState<number>(0);

  // Updates the validAddress when the inputAddress changes
  useEffect(() => {
    if (inputAddress && isAddress(inputAddress)) {
      setValidAddress(new EthereumAddress(inputAddress));
    }
  }, [inputAddress]);

  useEffect(() => {
    setRole(null);
  }, [adminAction]);

  /**
   * Displays an error toast message if the user is connected to an unsupported network
   * and prompts them to switch to the appropriate network.
   *
   * The appropriate network is determined based on the environment:
   * - In development (`isDev` is true), the required network is Scroll Sepolia.
   * - In production (`isDev` is false), the required network is Scroll.
   *
   * If the user is not connected to the required network, an error toast message
   * is displayed and the `switchChain` function is called to prompt the user to
   * switch to the required network.
   */
  const toastSwitchRightNetwork = () => {
    if (isDev ? chainId !== scrollSepolia.id : chainId !== scroll.id) {
      toast.error(
        `Unsupported network. Please switch to the ${isDev ? 'Scroll Sepolia' : 'Scroll'} network.`,
      );
      switchChain({ chainId: isDev ? scrollSepolia.id : scroll.id });
      return;
    }
  };

  /**
   * Checks if the user already has the specified role.
   *
   * @param {Address} address - The address of the user to check.
   * @returns {Promise<void>} - A promise that resolves when the check is complete.
   *
   * This function checks if the user already has the role specified by the `role` variable.
   * If the user already has the role, it sets the loading state to false and displays an error toast message.
   *
   * The roles checked are:
   * - ROOT
   * - MANAGER
   * - VILLAGER
   */
  const checkIfUserAlreadyHasTheRole = async (address: Address) => {
    const isRoot = await hasRole(ROLES.ROOT, address as Address);
    const isManager = await hasRole(ROLES.MANAGER, address as Address);
    const isVillager = await hasRole(ROLES.VILLAGER, address as Address);
    if (role == ROLES.ROOT && isRoot) {
      setIsLoading(false);
      toast.error('Address already has this role.');
      return;
    } else if (role == ROLES.MANAGER && isManager) {
      setIsLoading(false);
      toast.error('Address already has this role.');
      return;
    } else if (role == ROLES.VILLAGER && isVillager) {
      setIsLoading(false);
      toast.error('Address already has this role.');
      return;
    }
  };

  /**Root */
  const handleGrantRole = async () => {
    if (!address || !inputAddress || !role || !validAddress) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }

    await checkIfUserAlreadyHasTheRole(validAddress.address as Address);
    const response = await grantRole({
      from: address,
      role: role,
      account: validAddress.address as `0x${string}`,
      msgValue: BigInt(0),
    });

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${response.message}`);
      return;
    }

    if (response.status !== 'success') {
      setIsLoading(false);
      toast.error(`Transaction Rejected: Contract execution reverted.`);
      return;
    }

    setIsLoading(false);
    toast.success(
      `Badge sent at tx: ${`https://scrollscan.com//tx/${response.transactionHash}`}`,
    );
  };

  /**Root */
  const handleRevokeRole = async () => {
    if (!address || !inputAddress || !role || !validAddress) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }

    toastSwitchRightNetwork();
    const userHasRole = await hasRole(
      role,
      validAddress.address as `0x${string}`,
    );

    if (!userHasRole) {
      setIsLoading(false);
      toast.error("Address doesn't have this role.");
      return;
    }

    const response = await revokeRole({
      from: address,
      role: role,
      account: validAddress.address as `0x${string}`,
      msgValue: BigInt(0),
    });

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error('Transaction Rejected');
      return;
    }

    if (response.status !== 'success') {
      setIsLoading(false);
      toast.error('Transaction Rejected. Contract execution reverted.');
      return;
    }

    setIsLoading(false);
    toast.success(
      `Role revoked succefully. https://scrollscan.com//tx/${response.transactionHash}`,
    );
  };

  /**Root */
  const handleSetSchema = async () => {
    if (!address) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }

    toastSwitchRightNetwork();
    const response = await setSchema({
      from: address,
      uid: schemaUID as `0x${string}`,
      action: action,
      msgValue: BigInt(0),
    });

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${response.message}`);
      return;
    }

    if (response.status !== 'success') {
      setIsLoading(false);
      toast.error('Transaction Rejected. Contract execution reverted.');
      return;
    }

    toast.success(`Badge sent at tx: ${response.transactionHash}`);
    setIsLoading(false);
  };

  /**Manager  */
  const handleAttestationTitle = async () => {
    if (!address) {
      setIsLoading(false);
      toast.error('No account connected. Please connect your wallet.');
      return;
    }

    toastSwitchRightNetwork();
    const response = await setAttestationTitle({
      from: address,
      isValid: attestationBadgeIsValid,
      title: attestationTitleText,
      value: BigInt(0),
    });

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${response.message}`);
      return;
    }

    if (response.status !== 'success') {
      setIsLoading(false);
      toast.error('Transaction Rejected. Contract execution reverted.');
      return;
    }

    setIsLoading(false);
    toast.success(
      `Badge title added successfully. ${`https://scrollscan.com/tx/${response.transactionHash}`}`,
    );
    setNewTitleAdded(true);
  };

  /** MANAGER */
  const handleAttestationValidBadge = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const selectedRoleValue = event.target.value;

    if (selectedRoleValue === 'Yes') {
      setAttestationBadgeIsValid(true);
    } else if (selectedRoleValue === 'No') {
      setAttestationBadgeIsValid(false);
    }
  };

  const handleRoleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const selectedRoleValue = event.target.value;
    const rolesValues = Object.values(ROLES_OPTIONS);
    const selectedRole = rolesValues.find((role) => role === selectedRoleValue);

    if (selectedRole) {
      setRole(selectedRole);
    }
  };

  const handleRevokeManagerRole = async () => {
    toastSwitchRightNetwork();

    const queryVariables = {
      where: {
        schemaId: {
          equals: TRUSTFUL_SCHEMAS.ATTEST_MANAGER.uid,
        },
        recipient: {
          equals: inputAddress,
        },
        decodedDataJson: {
          contains: 'Manager',
        },
      },
    };

    const { response, success } = await fetchEASData(
      ID_CHECK_IN_QUERY,
      queryVariables,
    );

    if (!success || !response) {
      toast.error('Error while fetching Attestation data from Subgraphs');
      return;
    }

    if (response.data.data.attestations.length === 0) {
      toast.error("This user doesn't not have a Manager badge.");
      return;
    }

    if (response.data.data.attestations[0].revoked) {
      toast.error('This badge was already revoked.');
      return;
    }

    const txuid = response.data.data.attestations[0].id;
    const transactionResponse = await revoke(
      address as `0x${string}`,
      TRUSTFUL_SCHEMAS.ATTEST_MANAGER.uid,
      txuid as `0x${string}`,
      0n,
    );

    if (transactionResponse instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${transactionResponse.message}`);
      return;
    }

    if (transactionResponse.status !== 'success') {
      setIsLoading(false);
      toast.error('Transaction Rejected. Contract execution reverted.');
      return;
    }

    setIsLoading(false);
    toast.success(`Badge sent at tx: ${transactionResponse.transactionHash}`);
  };

  // Get the current title and move to state. It also updates the textarea height based on the content
  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textareaLineHeight = 22;
    const scrollHeight = event.target.scrollHeight - 16;

    const currentRows = Math.ceil(scrollHeight / textareaLineHeight);
    if (currentRows >= 2) {
      event.target.rows = currentRows;
    }
    setAttestationTitleText(event.target.value);
  };

  const handleActionSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    role: Role,
  ) => {
    let selectOptions = MANAGER_OPTIONS; //TODO: Start always with the villager
    if (role === Role.ROOT) {
      selectOptions = ADMIN_OPTIONS;
    }
    selectOptions.filter((admin) => {
      if (event.target.value === '') {
        setAdminAction(null);
      }
      if (event.target.value === admin.action) {
        setAdminAction(admin.action);
      }
    });
  };

  /*
   * Renders the appropriate admin action component based on the provided ADMIN_ACTION.
   */
  const renderAdminAction: Record<ADMIN_ACTION, React.JSX.Element> = {
    [ADMIN_ACTION.GRANT_ROLE]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Select
              placeholder="Select Role"
              className="flex text-black opacity-70 font-normal leading-tight"
              color="white"
              onChange={handleRoleSelectChange}
              focusBorderColor={'#B1EF42'}
            >
              {Object.entries(ROLES_OPTIONS).map(
                ([roleName, roleValue], index) => (
                  <option key={index} value={roleValue}>
                    {roleName}
                  </option>
                ),
              )}
            </Select>
          </Flex>
          <InputAddressUser
            label="Address to Grant Role"
            onInputChange={(value: string) => setInputAddress(value)}
            inputAddress={String(inputAddress)}
          />
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This is an access control function that works outside the scope of how Trustul is supposed to work and the behaviour of the dApp might not be as expected once you override.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!isAddress(inputAddress.toString()) || !role ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!isAddress(inputAddress.toString()) || !role}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !isAddress(inputAddress.toString()) ||
                (!role &&
                  toast.error(
                    'Please enter a valid address and select a role',
                  ));
              setIsLoading(true);
              handleGrantRole();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [ADMIN_ACTION.REVOKE_ROLE]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Select
              placeholder="Select Role"
              className="flex text-black opacity-70 font-normal leading-tight"
              color="white"
              onChange={handleRoleSelectChange}
              focusBorderColor={'#B1EF42'}
            >
              {Object.entries(ROLES_OPTIONS).map(
                ([roleName, roleValue], index) => (
                  <option key={index} value={roleValue}>
                    {roleName}
                  </option>
                ),
              )}
            </Select>
          </Flex>
          <InputAddressUser
            onInputChange={(value: string) => setInputAddress(value)}
            inputAddress={String(inputAddress)}
            label={'Address to Revoke Role'}
          />
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This is an access control function that works outside the scope of how Trustul is supposed to work and the behaviour of the dApp might not be as expected once you override.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className="w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg"
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!isAddress(inputAddress.toString()) || !role}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              setIsLoading(true);
              handleRevokeRole();
              !isAddress(inputAddress.toString()) ||
                (!role &&
                  toast.error(
                    'Please enter a valid address and select a role',
                  ));
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [ADMIN_ACTION.REVOKE_MANAGER]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <InputAddressUser
            onInputChange={(value: string) => setInputAddress(value)}
            inputAddress={String(inputAddress)}
            label={'Address to Revoke'}
          />
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This action is irreversible. You are revoking the Manager badge from the address ${inputAddress ? inputAddress : 'above'}. He will not be able to get this badge again and its status will show revoked for eternity in the EAS protocol. Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className="w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg"
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!isAddress(inputAddress.toString())}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              setIsLoading(true);
              handleRevokeManagerRole();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [ADMIN_ACTION.SET_ATTESTATION_TITLE]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Textarea
              className="text-black text-base font-normal leading-snug"
              color="white"
              placeholder="Set the Badge Title..."
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={attestationTitleText}
              onChange={handleTextareaChange}
              rows={attestationTitleText.length > 50 ? 3 : 1}
              minH="unset"
              resize="none"
            />
          </Flex>
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Select
              className="flex opacity-70 text-black font-normal leading-tight"
              color="white"
              placeholder="Select an option"
              onChange={handleAttestationValidBadge}
              focusBorderColor={'#B1EF42'}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Select>
          </Flex>
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-black opacity-70 text-sm font-normal leading-tight">
                Badge Validity:
                <br />
                {`Yes = Can be emitted/created/attested on the contract.`}
                <br />
                {`No = Cannot be emitted/created/attested on the contract.`}
              </Text>
            </Flex>
          </Box>
          <Button
            className="w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg"
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!attestationTitleText}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              setIsLoading(true);
              handleAttestationTitle();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [ADMIN_ACTION.SET_SCHEMA]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Textarea
              className="text-black opacity-70 text-base font-normal leading-snug"
              placeholder="Set Schema UID"
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={schemaUID}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                setSchemaUID(event.target.value);
              }}
              rows={schemaUID.length > 50 ? 3 : 1}
              minH="unset"
              resize="none"
            />
          </Flex>
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Select
              placeholder="Action schema"
              className="flex text-black opacity-70 text-sm font-normal leading-tight"
              color="white"
              onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                const actionSchemaValue = event.target.value;
                setAction(Number(actionSchemaValue));
              }}
              focusBorderColor={'#B1EF42'}
            >
              {Object.entries(ACTIONS_OPTIONS).map(
                ([schemaUID, actionSchemaValue], index) => (
                  <option key={index} value={actionSchemaValue}>
                    {schemaUID}
                  </option>
                ),
              )}
            </Select>
          </Flex>
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`Only use call this function if you really know what you are doing as it will affect how the Resolver Contract works with EAS and Trusful.`}
              </Text>
            </Flex>
          </Box>
          <Button
            className="w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg"
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!schemaUID}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              setIsLoading(true);
              handleSetSchema();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
  };

  return (
    <>
      {userRole ? (
        <>
          <Card
            background={'#F5FFFF0D'}
            className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
          >
            <Text className="text-white mb-2 font-medium leading-none">
              Select a function
            </Text>
            {userRole.role === Role.ROOT ? (
              <Select
                placeholder="Select option"
                className="flex text-black opacity-70 font-normal leading-tight"
                color="white"
                onChange={(e) => handleActionSelectChange(e, Role.ROOT)}
                focusBorderColor={'#B1EF42'}
              >
                {ADMIN_OPTIONS.map((admin, index) => (
                  <option key={index} value={admin.action}>
                    {admin.action}
                  </option>
                ))}
              </Select>
            ) : userRole.role === Role.MANAGER ? (
              <Select
                placeholder="Select option"
                className="flex text-black opacity-70 font-normal leading-tight"
                color="white"
                onChange={(e) => handleActionSelectChange(e, Role.MANAGER)}
                focusBorderColor={'#B1EF42'}
              >
                {MANAGER_OPTIONS.map((admin, index) => (
                  <option key={index} value={admin.action}>
                    {admin.action}
                  </option>
                ))}
              </Select>
            ) : null}
          </Card>
          {adminAction && renderAdminAction[adminAction]}
        </>
      ) : (
        <Box flex={1} className="flex justify-center items-center">
          <BeatLoader size={8} color="#B1EF42" />
        </Box>
      )}
    </>
  );
};
