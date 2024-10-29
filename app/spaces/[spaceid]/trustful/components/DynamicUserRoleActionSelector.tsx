/* eslint-disable no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Role } from '@/context/TrustfulContext';
import { isAddress } from 'ethers';

enum ROLES {
  ROOT = '22fb519433861c45473566e91e80aa1914463a0b4af5ac6bdf6df51390ffd531',
  MANAGER = 'b0338c231136c7d683dac0e65a1c5e782ff105b7aed212ee282bb75acacd28a1',
  VILLAGER = 'b6f4ee3f4de68852bfb9b340710124f632d1e4bbb9d14c935ffc5555829b5647',
}

enum ROOT_ACTION {
  GRANT_ROLE = 'Grant Role',
  REVOKE_ROLE = 'Revoke Role',
  SET_SCHEMA = 'Set Schema',
  REMOVE_SESSION = 'Remove Session',
}

enum MANAGER_ACTION {
  ASSIGN_MANAGER = 'Assign Manager',
  ASSIGN_VILLAGER = 'Assign Villager',
  SET_ATTESTATION_TITLE = 'Set Attestation Title',
}

enum VILLAGER_ACTION {
  ATTEST_EVENT = 'Attest Event',
  ATTEST_RESPONSE = 'Attest Response',
  ATTEST = 'Attest',
  CREATE_SESSION = 'Create Session',
  WRAP_SESSION = 'Wrap Session',
  JOIN_SESSION = 'Join Session',
}

type ActionType = ROOT_ACTION | MANAGER_ACTION | VILLAGER_ACTION;

interface ROLE_ACTIONS {
  ROOT: (ROOT_ACTION | MANAGER_ACTION | VILLAGER_ACTION)[];
  MANAGER: (MANAGER_ACTION | VILLAGER_ACTION)[];
  VILLAGER: VILLAGER_ACTION[];
  NO_ROLE: null;
}

const renderSelectByRole: Record<Role, ROLE_ACTIONS[keyof ROLE_ACTIONS]> = {
  [Role.ROOT]: [
    ...Object.values(ROOT_ACTION),
    ...Object.values(MANAGER_ACTION),
    ...Object.values(VILLAGER_ACTION),
  ],
  [Role.MANAGER]: [
    ...Object.values(MANAGER_ACTION),
    ...Object.values(VILLAGER_ACTION),
  ],
  [Role.VILLAGER]: [...Object.values(VILLAGER_ACTION)],
  [Role.NO_ROLE]: [],
};

export const DynamicUserRoleActionSelector = ({ role }: { role: Role }) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<ActionType>(
    renderSelectByRole[role]?.[0] as ActionType,
  );

  useEffect(() => {
    console.log('Role:', role);
    console.log('Actions for role:', renderSelectByRole[role]);
  }, [role]);

  useEffect(() => {
    setInputValues({});
    setError('');
  }, [selectedAction]);

  const handleActionChange = (event: SelectChangeEvent<ActionType>) => {
    setSelectedAction(event.target.value as ActionType);
  };

  const handleSubmit = () => {
    switch (role) {
      case Role.ROOT:
        if (selectedAction === ROOT_ACTION.GRANT_ROLE) {
          const address = inputValues['grant-user-address'];
          const selectedRole = inputValues['grant-user-role'];

          if (isAddress(address) && selectedRole) {
            setError('');
          } else {
            setError('Invalid Ethereum address');
            console.log('Invalid Ethereum address');
          }
          console.log(`Selected selectedRole: ${selectedRole}`);
        }
    }
    console.log(`Selected action: ${selectedAction}`);
  };

  const actions = renderSelectByRole[role] || [];

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
  ): void => {
    const { name, value } = event.target;
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const actionComponentsByRole: Record<
    Role,
    Partial<Record<ActionType, React.JSX.Element>>
  > = {} as Record<Role, Partial<Record<ActionType, React.JSX.Element>>>;

  (actionComponentsByRole[Role.ROOT] = {
    [ROOT_ACTION.GRANT_ROLE]: (
      <Box
        flexDirection={'column'}
        gap={2}
        display={'flex'}
        width={'fit-content'}
      >
        <Select
          value={inputValues[ROOT_ACTION.GRANT_ROLE]}
          onChange={handleInputChange}
          name="grant-user-role"
        >
          {Object.entries(ROLES).map(([roleName, roleValue]) => (
            <MenuItem key={roleValue} value={roleValue}>
              {roleName}
            </MenuItem>
          ))}
        </Select>

        <TextField
          variant="standard"
          label="Grant role to address"
          name="grant-user-address"
          onChange={handleInputChange}
          required
          error={!!error}
          helperText={error}
          className="text-white"
        />
      </Box>
    ),
    [ROOT_ACTION.REVOKE_ROLE]: <div>Revoke Role Component</div>,
    [ROOT_ACTION.SET_SCHEMA]: <div>Set Schema Component</div>,
    [ROOT_ACTION.REMOVE_SESSION]: <div>Wrap Session Component</div>,
    ...actionComponentsByRole[Role.MANAGER],
    ...actionComponentsByRole[Role.VILLAGER],
  }),
    (actionComponentsByRole[Role.MANAGER] = {
      [MANAGER_ACTION.ASSIGN_VILLAGER]: <div>Assign Villager Component</div>,
      [MANAGER_ACTION.SET_ATTESTATION_TITLE]: (
        <div>Set Attestation Title Component</div>
      ),
      ...actionComponentsByRole[Role.VILLAGER],
    }),
    (actionComponentsByRole[Role.VILLAGER] = {
      [VILLAGER_ACTION.ATTEST]: <div>Attest Component</div>,
      [VILLAGER_ACTION.CREATE_SESSION]: <div>Create Session Component</div>,
      [VILLAGER_ACTION.WRAP_SESSION]: <div>Wrap Session Component</div>,
      [VILLAGER_ACTION.JOIN_SESSION]: <div>Join Session Component</div>,
    }),
    (actionComponentsByRole[Role.NO_ROLE] = {});

  return (
    <Box flexDirection={'column'} gap={2}>
      <Select value={selectedAction} onChange={handleActionChange}>
        {actions.map((action) => (
          <MenuItem key={action} value={action}>
            {action}
          </MenuItem>
        ))}
      </Select>
      <Box flexDirection={'column'}>
        <Box>
          {selectedAction && actionComponentsByRole[role][selectedAction]}
        </Box>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </Box>
    </Box>
  );
};
