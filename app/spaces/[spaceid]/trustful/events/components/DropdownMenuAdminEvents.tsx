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
import { isAddress } from 'viem';
import { useAccount, useSwitchChain } from 'wagmi';
import {
  Role,
  ROLES,
} from '@/app/spaces/[spaceid]/trustful/constants/constants';
import { EthereumAddress } from '@/app/spaces/[spaceid]/trustful/utils/types';
import { useTrustful } from '@/context/TrustfulContext';
import toast from 'react-hot-toast';
import {
  EVENT_ACTION,
  EVENT_OPTIONS,
} from '@/app/spaces/[spaceid]/trustful/admin/components/ui-utils';

import { createEvents } from '../../service/backend/createEvents';

export const DropdownMenuAdminEvents = () => {
  const { address, chainId } = useAccount();
  const { userRole } = useTrustful();
  const [role, setRole] = useState<ROLES | null>(null);
  const [inputAddress, setInputAddress] = useState<string>('');
  const [validAddress, setValidAddress] = useState<EthereumAddress | null>(
    null,
  );
  const [eventAction, setEventAction] = useState<EVENT_ACTION | null>(null);
  const [isloading, setIsLoading] = useState<boolean>(false);

  const [inputValuesTextArea, setInputValuesTextArea] = useState<{
    [key: string]: string;
  }>({});
  const [inputValuesChange, setInputValuesChange] = useState<{
    [key: string]: string;
  }>({});

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
  }, [eventAction]);

  useEffect(() => {
    console.log('inputValuesTextArea', inputValuesTextArea);
  }, [inputValuesTextArea]);

  useEffect(() => {
    console.log('inputValuesChange', inputValuesChange);
  }, [inputValuesChange]);

  /** EVENT */
  const handleCreateEvent = async () => {
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

    const response = await createEvents({
      name: inputValuesTextArea['createEventName'],
      description: inputValuesTextArea['createEventDescription'],
      spaceId: Number(inputValuesChange['createEventSpaceId']), // TODO: GET FROM SPACEID PARAM
      zucityId: Number(inputValuesChange['createSessionZucityId']),
      user: userRole,
    });

    console.log('response CreateEvents', response);

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
    let selectOptions = EVENT_OPTIONS;
    selectOptions.filter((option) => {
      if (event.target.value === '') {
        setEventAction(null);
      }
      if (event.target.value === option.action) {
        setEventAction(option.action);
      }
    });
  };

  const renderEventAction: Record<EVENT_ACTION, React.JSX.Element> = {
    [EVENT_ACTION.CREATE_EVENT]: (
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
              placeholder="Name..."
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={inputValuesTextArea['createEventName'] || ''}
              name="createEventName"
              onChange={handleInputValuesTextareaChange}
              rows={
                (inputValuesTextArea['createEventName'] || '').length > 50
                  ? 3
                  : 1
              }
              minH="unset"
              resize="none"
            />
            <Textarea
              style={{ color: 'black' }}
              className="text-black text-base font-normal leading-snug"
              color="white"
              placeholder="Description..."
              _placeholder={{
                className: 'text-black',
              }}
              focusBorderColor={'#B1EF42'}
              value={inputValuesTextArea['createEventDescription'] || ''}
              name="createEventDescription"
              onChange={handleInputValuesTextareaChange}
              rows={
                (inputValuesTextArea['createEventDescription'] || '').length >
                50
                  ? 3
                  : 1
              }
              minH="unset"
              resize="none"
            />
            <Text>
              spaceId: Passo por parametro ou coloco o valor aqui já
              pré-definido
            </Text>
            <Input
              style={{ color: 'black' }}
              name="createEventSpaceId"
              placeholder="Space id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['createEventSpaceId'] || 0}
              type="number"
              min={1}
            />
            <Text>ZuCityId:</Text>
            <Input
              style={{ color: 'black' }}
              name="createEventZucityId"
              placeholder="zucity Id"
              onChange={handleInputValuesChange}
              value={inputValuesChange['createEventZucityId"'] || 0}
              type="number"
              min={1}
            />
          </Flex>
          <Box>
            <Flex className="pb-4 gap-4 items-center">
              <Text className="flex min-w-[80px] text-white opacity-70 text-sm font-normal leading-tight">
                &#x26A0;WARNING&#x26A0;
                <br />
                {`This will create the event from the contract and the user will not be able to create another until this session be finished.`}
                <br />
                {`Are you sure you want to proceed?`}
              </Text>
            </Flex>
          </Box>
          <Button
            className={`w-full justify-center items-center gap-2 px-6 bg-[#B1EF42] text-[#161617] rounded-lg ${!inputValuesTextArea['createEventSpaceId'] ? 'cursor-not-allowed opacity-10' : ''}`}
            _hover={{ bg: '#B1EF42' }}
            _active={{ bg: '#B1EF42' }}
            isLoading={isloading}
            isDisabled={!inputValuesChange['createEventSpaceId']}
            spinner={<BeatLoader size={8} color="white" />}
            onClick={() => {
              !inputValuesChange['createEventSpaceId'] &&
                toast.error('Please enter a valid address');
              setIsLoading(true);
              handleCreateEvent();
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
            {userRole.role === Role.ROOT || userRole.role === Role.MANAGER ? (
              <Select
                placeholder="Select option"
                className="flex text-black opacity-70 font-normal leading-tight"
                color="white"
                onChange={handleActionSelectChange}
                focusBorderColor={'#B1EF42'}
              >
                {EVENT_OPTIONS.map((event, index) => (
                  <option key={index} value={event.action}>
                    {event.action}
                  </option>
                ))}
              </Select>
            ) : (
              toast.error('No role found')
            )}
          </Card>
          {eventAction && renderEventAction[eventAction]}
        </>
      ) : (
        <Box flex={1} className="flex justify-center items-center">
          <BeatLoader size={8} color="#B1EF42" />
        </Box>
      )}
    </>
  );
};
