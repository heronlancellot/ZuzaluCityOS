import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Yup from '@/utils/yupExtensions';
import {
  Box,
  Typography,
  Stack,
  FormHelperText,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimezoneSelector } from '@/components/select/TimezoneSelector';
import { useEditorStore } from '@/components/editor/useEditorStore';
import { ZuInput, ZuSwitch } from 'components/core';
import {
  FormLabel,
  FormLabelDesc,
  FormTitle,
} from '@/components/typography/formTypography';
import Dialog from '@/app/spaces/components/Modal/Dialog';
import { DesktopDatePicker, TimePicker } from '@mui/x-date-pickers';
import { ITimezoneOption } from 'react-timezone-select';
import { useCeramicContext } from '@/context/CeramicContext';
import FormFooter from '@/components/form/FormFooter';
import FormHeader from '@/components/form/FormHeader';
import { FormatCheckbox } from '@/components/form/FormatCheckbox';
import FormUploader from '@/components/form/FormUploader';

import dynamic from 'next/dynamic';
const SuperEditor = dynamic(() => import('@/components/editor/SuperEditor'), {
  ssr: false,
});

import dayjs from 'dayjs';

const schema = Yup.object().shape({
  name: Yup.string().required('Event name is required'),
  description: Yup.string(),
  isAllDay: Yup.boolean(),
  startDate: Yup.mixed().dayjs().required('Start date is required'),
  endDate: Yup.mixed().dayjs().required('End date is required'),
  startTime: Yup.mixed()
    .dayjs()
    .when('isAllDay', {
      is: false,
      then: (schema) => schema.required('Start time is required'),
    }),
  endTime: Yup.mixed()
    .dayjs()
    .when('isAllDay', {
      is: false,
      then: (schema) => schema.required('End time is required'),
    }),
  timezone: Yup.object().shape({
    value: Yup.string(),
  }),
  recurring: Yup.string(),
  imageUrl: Yup.string(),
  format: Yup.string(),
  locationName: Yup.string().when('format', {
    is: (format: string) => format === 'in-person' || format === 'hybrid',
    then: (schema) => schema.required('Location name is required'),
  }),
  locationUrl: Yup.string().when('format', {
    is: (format: string) => format === 'online' || format === 'hybrid',
    then: (schema) => schema.required('Location URL is required'),
  }),
});

type FormData = Yup.InferType<typeof schema>;

interface EventFormProps {
  spaceId: string;
  handleClose: () => void;
}

const CreateEventForm: React.FC<EventFormProps> = ({
  spaceId,
  handleClose,
}) => {
  const [track, setTrack] = useState('');
  const descriptionEditorStore = useEditorStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      format: 'in-person',
      startDate: dayjs(),
      endDate: dayjs(),
      startTime: dayjs(),
      endTime: dayjs().add(1, 'hour'),
      isAllDay: false,
      recurring: 'none',
    },
    shouldFocusError: true,
  });

  const isAllDay = watch('isAllDay');
  const format = watch('format');

  const [isLoading, setLoading] = useState(false);
  const [blockClickModal, setBlockClickModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { profile, ceramic } = useCeramicContext();
  const profileId = profile?.id || '';
  const adminId = ceramic?.did?.parent || '';

  const handleDescriptionChange = useCallback(
    (val: any) => {
      descriptionEditorStore.setValue(val);
    },
    [descriptionEditorStore],
  );

  const onFormSubmit = useCallback(async (data: FormData) => {}, []);

  const handleDialogClose = useCallback(() => {
    setShowModal(false);
    setBlockClickModal(false);
    handleClose();
  }, [handleClose]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        title="Event Created"
        message="Please view it."
        showModal={showModal}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose}
      />
      <Dialog
        showModal={blockClickModal}
        showActions={false}
        title="Creating Event"
        message="Please wait while the event is being created..."
      />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
          <FormHeader title="Create Event" handleClose={handleClose} />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <Stack gap="20px" p="20px" pb="80px">
            <Box display="flex" flexDirection="column" gap="20px">
              <Box bgcolor="#262626" borderRadius="10px">
                <Stack padding="20px 20px 0" gap="10px">
                  <FormTitle>Event Details</FormTitle>
                  <Typography
                    fontSize={14}
                    lineHeight={1.6}
                    sx={{ opacity: 0.6 }}
                  >
                    Set event title and description
                  </Typography>
                </Stack>
                <Box
                  padding="0 20px 20px"
                  mt="30px"
                  display="flex"
                  flexDirection="column"
                  gap="20px"
                >
                  <Stack spacing="10px">
                    <FormLabel>Event Name*</FormLabel>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <ZuInput
                            {...field}
                            placeholder="a name for this calendar event"
                            error={!!error}
                          />
                          {error && (
                            <FormHelperText error>
                              {error.message}
                            </FormHelperText>
                          )}
                        </>
                      )}
                    />
                  </Stack>
                  <Stack spacing="10px">
                    <FormLabel>Event Description</FormLabel>
                    <FormLabelDesc>
                      This is a description greeting for new members. You can
                      also update descriptions.
                    </FormLabelDesc>
                    <SuperEditor
                      value={descriptionEditorStore.value}
                      onChange={handleDescriptionChange}
                    />
                    {errors?.description && (
                      <FormHelperText error>
                        {errors?.description.message}
                      </FormHelperText>
                    )}
                  </Stack>
                  <Stack spacing="10px">
                    <FormLabel>Event Image</FormLabel>
                    <FormLabelDesc>
                      Recommend min of 620x338px (16:9 Ratio)
                    </FormLabelDesc>
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => <FormUploader {...field} />}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap="20px">
              <Box bgcolor="#262626" borderRadius="10px">
                <Stack padding="20px 20px 0" gap="10px">
                  <FormTitle>Date & Time</FormTitle>
                  <Typography
                    fontSize={14}
                    lineHeight={1.6}
                    sx={{ opacity: 0.6 }}
                  >
                    Set event date, times and frequency
                  </Typography>
                </Stack>
                <Box
                  padding="0 20px 20px"
                  mt="30px"
                  display="flex"
                  flexDirection="column"
                  gap="20px"
                >
                  <Box display="flex" alignItems="center" gap="20px">
                    <Controller
                      name="isAllDay"
                      control={control}
                      render={({ field }) => <ZuSwitch {...field} />}
                    />
                    <Typography fontSize={16} lineHeight={1.2} fontWeight={600}>
                      All Day
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" gap="20px">
                    <Stack flex={1} spacing="10px">
                      <FormLabel>Start Date*</FormLabel>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <DesktopDatePicker {...field} />
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    </Stack>
                    <Stack flex={1} spacing="10px">
                      <FormLabel>End Date*</FormLabel>
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <DesktopDatePicker {...field} />
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    </Stack>
                  </Box>
                  {!isAllDay && (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      gap="20px"
                    >
                      <Stack flex={1} spacing="10px">
                        <FormLabel>Start Time*</FormLabel>
                        <Controller
                          name="startTime"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <>
                              <TimePicker {...field} />
                              {error && (
                                <FormHelperText error>
                                  {error.message}
                                </FormHelperText>
                              )}
                            </>
                          )}
                        />
                      </Stack>
                      <Stack flex={1} spacing="10px">
                        <FormLabel>End Time*</FormLabel>
                        <Controller
                          name="endTime"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <>
                              <TimePicker {...field} />
                              {error && (
                                <FormHelperText error>
                                  {error.message}
                                </FormHelperText>
                              )}
                            </>
                          )}
                        />
                      </Stack>
                    </Box>
                  )}
                  <Stack spacing={'10px'}>
                    <FormLabel>Timezone</FormLabel>
                    <Controller
                      name="timezone"
                      control={control}
                      render={({ field }) => (
                        <TimezoneSelector
                          value={field.value as ITimezoneOption}
                          setSelectedTimezone={(v) =>
                            setValue('timezone', v as ITimezoneOption)
                          }
                          sx={{
                            width: '100%',
                          }}
                        />
                      )}
                    />
                  </Stack>
                  <Stack spacing={'10px'}>
                    <FormLabel>Session Frequency</FormLabel>
                    <Controller
                      name="recurring"
                      control={control}
                      render={({ field }) => (
                        <Select size="small" {...field}>
                          <MenuItem value="none">Only Once</MenuItem>
                          <MenuItem value="daily">Every Day</MenuItem>
                          <MenuItem value="weekly">Every Week</MenuItem>
                          <MenuItem value="monthly">Every Month</MenuItem>
                        </Select>
                      )}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap="20px">
              <Box bgcolor="#262626" borderRadius="10px">
                <Stack padding="20px 20px 0" gap="10px">
                  <FormTitle>Format & Location</FormTitle>
                  <Typography
                    fontSize={14}
                    lineHeight={1.6}
                    sx={{ opacity: 0.6 }}
                  >
                    Set event format and location with links
                  </Typography>
                </Stack>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="20px"
                  padding="20px"
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap="20px"
                    width={'100%'}
                  >
                    {[
                      {
                        title: 'In-Person',
                        desc: 'This is a physical event',
                        value: 'in-person',
                      },
                      {
                        title: 'Online',
                        desc: 'This is a virtual event',
                        value: 'online',
                      },
                      {
                        title: 'Hybrid',
                        desc: 'Both In-Person & Online',
                        value: 'hybrid',
                      },
                    ].map((item, index) => (
                      <FormatCheckbox
                        key={`FormatCheckbox-${index}`}
                        checked={format === item.value}
                        handleChange={() => setValue('format', item.value)}
                        title={item.title}
                        desc={item.desc}
                      />
                    ))}
                  </Box>
                  {format !== 'online' && (
                    <Stack spacing="10px">
                      <FormLabel>Location Name*</FormLabel>
                      <Controller
                        name="locationName"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <ZuInput
                              {...field}
                              placeholder="a name for this calendar event"
                              error={!!error}
                            />
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    </Stack>
                  )}
                  {format !== 'in-person' && (
                    <Stack spacing="10px">
                      <FormLabel>Location URL*</FormLabel>
                      <Controller
                        name="locationUrl"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <ZuInput
                              {...field}
                              placeholder="https://"
                              error={!!error}
                            />
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    </Stack>
                  )}
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
          }}
        >
          <Box p="20px" bgcolor="#222">
            <FormFooter
              confirmText="Create Event"
              disabled={isLoading}
              handleClose={handleClose}
              handleConfirm={handleSubmit(onFormSubmit)}
            />
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateEventForm;
