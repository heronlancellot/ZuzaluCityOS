/* eslint-disable no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { Role } from '@/context/TrustfulContext';

enum ROOT_ACTION {
  ASSIGN_MANAGER = 'Assign Manager',
  REVOKE_MANAGER = 'Revoke Manager',
  SET_ATTESTATION_TITLE = 'Set Attestation Title',
  SET_SCHEMA = 'Set Schema',
}

enum MANAGER_ACTION {
  CREATE_EVENT = 'Create Event',
  WRAP_EVENT = 'Wrap Event',
  CREATE_BADGE = 'Create Badge',
  ASSIGN_VILLAGER = 'Assign Villager',
  REVOKE_VILLAGER = 'Revoke Villager',
}

enum VILLAGER_ACTION {
  CREATE_SESSION = 'Create Session',
  WRAP_SESSION = 'Wrap Session',
  ISSUE_BADGE = 'Issue Badge',
  JOIN_EVENT = 'Join Event',
}

type ActionType = ROOT_ACTION | MANAGER_ACTION | VILLAGER_ACTION;

interface ROLE_ACTIONS {
  ROOT: ROOT_ACTION[];
  MANAGER: MANAGER_ACTION[];
  VILLAGER: VILLAGER_ACTION[];
  NO_ROLE: null;
}

const renderSelectByRole: Record<Role, ROLE_ACTIONS[keyof ROLE_ACTIONS]> = {
  [Role.ROOT]: [
    ROOT_ACTION.ASSIGN_MANAGER,
    ROOT_ACTION.REVOKE_MANAGER,
    ROOT_ACTION.SET_ATTESTATION_TITLE,
    ROOT_ACTION.SET_SCHEMA,
  ],
  [Role.MANAGER]: [
    MANAGER_ACTION.CREATE_EVENT,
    MANAGER_ACTION.WRAP_EVENT,
    MANAGER_ACTION.CREATE_BADGE,
    MANAGER_ACTION.ASSIGN_VILLAGER,
    MANAGER_ACTION.REVOKE_VILLAGER,
  ],
  [Role.VILLAGER]: [
    VILLAGER_ACTION.CREATE_SESSION,
    VILLAGER_ACTION.WRAP_SESSION,
    VILLAGER_ACTION.ISSUE_BADGE,
    VILLAGER_ACTION.JOIN_EVENT,
  ],
  [Role.NO_ROLE]: [],
};

const actionComponentsByRole: Record<
  Role,
  Partial<Record<ActionType, React.JSX.Element>>
> = {
  [Role.ROOT]: {
    [ROOT_ACTION.ASSIGN_MANAGER]: <div>Assign Manager Component</div>,
    [ROOT_ACTION.REVOKE_MANAGER]: <div>Revoke Manager Component</div>,
    [ROOT_ACTION.SET_ATTESTATION_TITLE]: (
      <div>Set Attestation Title Component</div>
    ),
    [ROOT_ACTION.SET_SCHEMA]: <div>Set Schema Component</div>,
  },
  [Role.MANAGER]: {
    [MANAGER_ACTION.CREATE_EVENT]: <div>Create Event Component</div>,
    [MANAGER_ACTION.WRAP_EVENT]: <div>Wrap Event Component</div>,
    [MANAGER_ACTION.CREATE_BADGE]: <div>Create Badge Component</div>,
    [MANAGER_ACTION.ASSIGN_VILLAGER]: <div>Assign Villager Component</div>,
    [MANAGER_ACTION.REVOKE_VILLAGER]: <div>Revoke Villager Component</div>,
  },
  [Role.VILLAGER]: {
    [VILLAGER_ACTION.CREATE_SESSION]: <div>Create Session Component</div>,
    [VILLAGER_ACTION.WRAP_SESSION]: <div>Wrap Session Component</div>,
    [VILLAGER_ACTION.ISSUE_BADGE]: <div>Issue Badge Component</div>,
    [VILLAGER_ACTION.JOIN_EVENT]: <div>Join Event Component</div>,
  },
  [Role.NO_ROLE]: {},
};
export const DynamicUserRoleActionSelector = ({ role }: { role: Role }) => {
  const [selectedAction, setSelectedAction] = useState<ActionType>(
    renderSelectByRole[role]?.[0] as ActionType,
  );

  useEffect(() => {
    console.log('Role:', role);
    console.log('Actions for role:', renderSelectByRole[role]);
  }, [role]);

  const handleActionChange = (event: SelectChangeEvent<ActionType>) => {
    setSelectedAction(event.target.value as ActionType);
    console.log(`Selected action: handleActionChange ${selectedAction}`);
  };

  const handleSubmit = () => {
    // Handle the submit action here
    console.log(`Selected action: ${selectedAction}`);
  };

  const actions = renderSelectByRole[role] || [];
  console.log('actions', actions);

  return (
    <Box>
      <Select value={selectedAction} onChange={handleActionChange}>
        {actions.map((action) => (
          <MenuItem key={action} value={action}>
            {action}
          </MenuItem>
        ))}
      </Select>
      <Box flexDirection={'column'}>
        <Button onClick={handleSubmit}>Submit</Button>
      </Box>
      <Box>
        {selectedAction && actionComponentsByRole[role][selectedAction]}
      </Box>
    </Box>
  );
};
