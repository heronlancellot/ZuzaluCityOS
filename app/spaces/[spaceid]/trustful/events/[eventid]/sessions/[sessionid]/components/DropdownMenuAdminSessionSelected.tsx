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
  Input,
} from '@chakra-ui/react';
import { BeatLoader } from 'react-spinners';
import { Address, isAddress } from 'viem';
import { scroll, scrollSepolia } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';
import {
  isDev,
  Role,
  ROLES,
} from '@/app/spaces/[spaceid]/trustful/constants/constants';
import { removeSession } from '@/app/spaces/[spaceid]/trustful/service/smart-contract';
import { EthereumAddress } from '@/app/spaces/[spaceid]/trustful/utils/types';
import { useTrustful } from '@/context/TrustfulContext';
import toast from 'react-hot-toast';
import {
  EVENT_ACTION,
  EVENT_OPTIONS,
  SESSION_ACTION,
  SESSION_OPTIONS,
} from '@/app/spaces/[spaceid]/trustful/admin/components/ui-utils';
import { InputAddressUser } from '@/app/spaces/[spaceid]/trustful/components/';
import {
  joinSession,
  createSession,
  deleteSession,
} from '@/app/spaces/[spaceid]/trustful/service/backend/';
import {
  Event,
  getAllEvents,
} from '@/app/spaces/[spaceid]/trustful/service/backend';
import { useParams } from 'next/navigation';

export const DropdownMenuAdminSessionSelected = () => {
  const { address, chainId } = useAccount();
  const { userRole } = useTrustful();
  const { switchChain } = useSwitchChain();
  const [role, setRole] = useState<ROLES | null>(null);
  const [inputAddress, setInputAddress] = useState<string>('');
  const [validAddress, setValidAddress] = useState<EthereumAddress | null>(
    null,
  );
  const [sessionAction, setSessionAction] = useState<SESSION_ACTION | null>(
    null,
  );
  const [isloading, setIsLoading] = useState<boolean>(false);

  const [inputValuesTextArea, setInputValuesTextArea] = useState<{
    [key: string]: string;
  }>({});
  const [inputValuesChange, setInputValuesChange] = useState<{
    [key: string]: string;
  }>({});
  const [events, setEvents] = useState<Event[] | undefined>([]);
  const params = useParams();
  const spaceId = params.spaceid.toString();

  console.log('spaceIdspaceIdspaceId', spaceId);

  // Updates the validAddress when the inputAddress changes
  useEffect(() => {
    if (inputAddress && isAddress(inputAddress)) {
      setValidAddress(new EthereumAddress(inputAddress));
    }
  }, [inputAddress]);

  useEffect(() => {
    console.log('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    setRole(null);
  }, [sessionAction]);

  useEffect(() => {
    console.log('inputValuesTextArea', inputValuesTextArea);
  }, [inputValuesTextArea]);

  useEffect(() => {
    console.log('inputValuesChange', inputValuesChange);
  }, [inputValuesChange]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const eventsData = await getAllEvents({
          spaceId: Number(spaceId),
          userAddress: address as Address,
        });
        setEvents(eventsData);
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchAllEvents();
  }, []);

  /**Root */
  const handleRemoveSession = async () => {
    if (!address || !userRole) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }

    if (!validAddress) {
      setIsLoading(false);
      toast.error('Please enter a valid address.');
      return;
    }

    const responseSmartContract = await removeSession({
      from: address,
      sessionTitle: inputValuesTextArea['removeSessionTitle'],
      sessionOwner: validAddress.address as Address,
      msgValue: BigInt(0),
    });
    console.log('responseSmartContract', responseSmartContract);

    const responseBackend = await deleteSession({
      role: userRole.role,
      sessionId: Number(inputValuesChange['removeSessionId']),
      userAddress: validAddress.address as Address,
    });

    console.log('responseBackend', responseBackend);

    setIsLoading(false);
    // toast.success(
    //   `Badge sent at tx: ${`https://scrollscan.com//tx/${response.transactionHash}`}`,
    // );
  };

  /** VILLAGER */
  const handleJoinSession = async () => {
    if (!address || !userRole) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }

    const response = await joinSession({
      role: userRole.role,
      sessionId: Number(inputValuesChange['sessionId']),
      userAddress: userRole.address,
    });

    console.log('response ', response);

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${response.message}`);
      return;
    }

    setIsLoading(false);
    toast.success('Session joined successfully!');
  };

  /** VILLAGER */
  const handleCreateSession = async () => {
    if (!address) {
      setIsLoading(false);
      toast.error('Please connect first. No address found.');
      return;
    }
    if (!userRole || userRole.role == Role.NO_ROLE) {
      setIsLoading(false);
      toast.error('Please connect first. No userRole found.');
      return;
    }
    console.log('validAddress', validAddress);

    const response = await createSession({
      user: userRole,
      name: inputValuesTextArea['createSessionName'],
      eventId: Number(inputValuesChange['createSessionEventId']),
      zucityId: Number(inputValuesChange['createSessionZucityId']),
      hostAddress: validAddress?.address as Address,
    });

    if (response instanceof Error) {
      setIsLoading(false);
      toast.error(`Transaction Rejected: ${response.message}`);
      return;
    }

    setIsLoading(false);
    toast.success('Session created successfully!');
  };

  const handleInputValuesTextareaChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const textareaLineHeight = 22;
    const scrollHeight = event.target.scrollHeight - 16;

    const currentRows = Math.ceil(scrollHeight / textareaLineHeight);
    if (currentRows >= 2) {
      event.target.rows = currentRows;
    }

    const { name, value } = event.target;
    setInputValuesTextArea((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleInputValuesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputValuesChange((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleActionSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    let selectOptions = SESSION_OPTIONS;
    selectOptions.filter((option) => {
      if (event.target.value === '') {
        setSessionAction(null);
      }
      if (event.target.value === option.action) {
        setSessionAction(option.action);
      }
    });
  };

  /*
   * Renders the appropriate admin action component based on the provided ADMIN_ACTION.
   */
  const renderSessionAction: Record<SESSION_ACTION, React.JSX.Element> = {
    [SESSION_ACTION.REMOVE_SESSION]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Textarea
              style={{ color: 'black' }}
              className="text-black text-base font-normal leading-snug"
              color="white"
              placeholder="Set the Session Title..."
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={inputValuesTextArea['removeSessionTitle'] || ''}
              name="removeSessionTitle"
              onChange={handleInputValuesTextareaChange}
              rows={
                (inputValuesTextArea['removeSessionTitle'] || '').length > 50
                  ? 3
                  : 1
              }
              minH="unset"
              resize="none"
            />
          </Flex>
          <InputAddressUser
            label="Address to Session Owner"
            onInputChange={(value: string) => setInputAddress(value)}
            inputAddress={String(inputAddress)}
          />
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This will remove the session from the contract and the user will not be able to access it anymore.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!isAddress(inputAddress.toString()) || !inputValuesTextArea['removeSession'] ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={
              !isAddress(inputAddress.toString()) ||
              !inputValuesTextArea['removeSessionTitle']
            }
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !isAddress(inputAddress.toString()) ||
                (!inputValuesTextArea['removeSessionTitle'] &&
                  toast.error(
                    'Please enter a valid address and set the session title to remove',
                  ));
              setIsLoading(true);
              handleRemoveSession();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [SESSION_ACTION.JOIN_SESSION]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Input
              style={{ color: 'black' }}
              name="joinSession"
              placeholder="Session id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['joinSession'] || 0}
              type="number"
              min={1}
            />
          </Flex>
          {/** The villager can join the sesssion only with the sessionId */}
          {userRole && userRole.role == Role.MANAGER && Role.ROOT && (
            <InputAddressUser
              label="User Address"
              onInputChange={(value: string) => setInputAddress(value)}
              inputAddress={String(inputAddress)}
            />
          )}
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`Do you wanna join this user in session ${inputValuesChange['joinSession']}?`}
                <br />
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!isAddress(inputAddress.toString()) ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!isAddress(inputAddress.toString())}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !isAddress(inputAddress.toString()) &&
                toast.error('Please enter a valid address.');
              setIsLoading(true);
              handleJoinSession();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [SESSION_ACTION.CREATE_SESSION]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Textarea
              style={{ color: 'black' }}
              className="text-black text-base font-normal leading-snug"
              color="white"
              placeholder="Set the Session Name..."
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={inputValuesTextArea['createSessionName'] || ''}
              name="createSessionName"
              onChange={handleInputValuesTextareaChange}
              rows={
                (inputValuesTextArea['createSessionName'] || '').length > 50
                  ? 3
                  : 1
              }
              minH="unset"
              resize="none"
            />
            <Text>eventId:</Text>
            <Input
              style={{ color: 'black' }}
              name="createSessionEventId"
              placeholder="Event id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['createSessionEventId'] || 0}
              type="number"
              min={1}
            />
            <Text>ZuCityId:</Text>
            <Input
              style={{ color: 'black' }}
              name="createSessionzucityId"
              placeholder="zucity Id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['createSessionzucityId'] || 0}
              type="number"
              min={1}
            />
          </Flex>
          <Text>HostAddress:</Text>
          <InputAddressUser
            label="Address to host Address"
            onInputChange={(value: string) => setInputAddress(value)}
            inputAddress={String(inputAddress)}
          />
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This will create the session from the contract and the user will not be able to create another until this session be finished.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!isAddress(inputAddress.toString()) || !inputValuesTextArea['createSessionName'] ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={
              !isAddress(inputAddress.toString()) ||
              !inputValuesChange['createSessionEventId']
            }
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !isAddress(inputAddress.toString()) ||
                (!inputValuesChange['createSessionEventId'] &&
                  toast.error('Please enter a valid address'));
              setIsLoading(true);
              handleCreateSession();
            }}
          >
            <CheckIcon className="w-[16px] h-[16px]" />
            Confirm
          </Button>
        </Flex>
      </Card>
    ),
    [SESSION_ACTION.WRAP_SESSION]: (
      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
      >
        <Flex className="w-full flex-col">
          <Flex className="gap-4 pb-4 justify-start items-center">
            <Input
              style={{ color: 'black' }}
              name="wrapSessionId"
              placeholder="Session id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['wrapSessionId'] || 0}
              type="text"
            />
          </Flex>
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This will close the session from the contract and the user will not be able to access it anymore.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!isAddress(inputAddress.toString()) || !inputValuesTextArea['removeSession'] ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={
              !isAddress(inputAddress.toString()) ||
              !inputValuesChange['wrapSessionId']
            }
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !isAddress(inputAddress.toString()) ||
                (!inputValuesChange['wrapSessionId'] &&
                  toast.error(
                    'Please enter a valid sessionId to wrap the session',
                  ));
              setIsLoading(true);
              handleRemoveSession();
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
            {userRole.role === Role.VILLAGER ? (
              <Select
                placeholder="Select option"
                className="flex text-black opacity-70 font-normal leading-tight"
                color="white"
                onChange={handleActionSelectChange}
                focusBorderColor={'#B1EF42'}
              >
                {SESSION_OPTIONS.filter(
                  (option) => option.action === SESSION_ACTION.JOIN_SESSION,
                ).map((event, index) => (
                  <option key={index} value={event.action}>
                    {event.action}
                  </option>
                ))}
              </Select>
            ) : (
              toast.error('No role found')
            )}
          </Card>
          {sessionAction && renderSessionAction[sessionAction]}
        </>
      ) : (
        <Box flex={1} className="flex justify-center items-center">
          <BeatLoader size={8} color="#B1EF42" />
        </Box>
      )}
    </>
  );
};
