import React, { useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Yup from '@/utils/yupExtensions';
import {
  Box,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  TextField,
  Chip,
  FormHelperText,
  FormControl,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimezoneSelector } from '@/components/select/TimezoneSelector';
import { useEditorStore } from '@/components/editor/useEditorStore';
import { ZuButton, ZuInput, ZuSwitch } from 'components/core';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
  FormLabel,
  FormLabelDesc,
  FormTitle,
} from '@/components/typography/formTypography';
import { SOCIAL_TYPES } from '@/constant';
import Dialog from '@/app/spaces/components/Modal/Dialog';
import { DesktopDatePicker, TimePicker } from '@mui/x-date-pickers';
import { ITimezoneOption } from 'react-timezone-select';
import dayjs from 'dayjs';
import { CreateEventRequest } from '@/types';
import { useCeramicContext } from '@/context/CeramicContext';
import { createEventKeySupa } from '@/services/event/createEvent';
import FormFooter from '@/components/form/FormFooter';
import FormHeader from '@/components/form/FormHeader';
import FormatCheckboxGroup, {
  FormatCheckbox,
  NewFormatCheckboxGroup,
} from '@/components/form/FormatCheckbox';
import FormUploader from '@/components/form/FormUploader';
import { PlusIcon } from '@/components/icons';
import { covertNameToUrlName } from '@/utils/format';
import { createUrl } from '@/services/url';

import dynamic from 'next/dynamic';
const SuperEditor = dynamic(() => import('@/components/editor/SuperEditor'), {
  ssr: false,
});

const schema = Yup.object().shape({
  name: Yup.string().required('Event name is required'),
  tagline: Yup.string().required('Event tagline is required'),
  description: Yup.string(),
  externalUrl: Yup.string().required('External Website is required'),
  startTime: Yup.mixed().dayjs().required('Start date is required'),
  endTime: Yup.mixed().dayjs().required('End date is required'),
  timezone: Yup.object().shape({
    value: Yup.string(),
  }),
  imageUrl: Yup.string(),
  participant: Yup.number()
    .positive()
    .integer()
    .required('Participant number is required'),
  max_participant: Yup.number()
    .positive()
    .integer()
    .required('Max participant number is required'),
  min_participant: Yup.number()
    .positive()
    .integer()
    .required('Min participant number is required'),
  isPerson: Yup.boolean(),
  locations: Yup.array()
    .of(Yup.string().required('Location is required'))
    .min(1, 'At least one location is required'),
  socialLinks: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required('Social media type is required'),
        links: Yup.string()
          .url('Must be a valid URL')
          .required('URL is required'),
      }),
    )
    .min(1, 'At least one social media is required'),
  tracks: Yup.array(Yup.string().required('Track is required')).min(
    1,
    'At least one track is required',
  ),
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
      socialLinks: [{ title: '', links: '' }],
      locations: [''],
      isPerson: true,
      participant: 10,
      min_participant: 10,
      max_participant: 10,
      tracks: [],
    },
    shouldFocusError: true,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialLinks',
  });
  const locations = watch('locations');
  const tracks = watch('tracks');
  const isPerson = watch('isPerson');

  const [isLoading, setLoading] = useState(false);
  const [blockClickModal, setBlockClickModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { profile, ceramic } = useCeramicContext();
  const profileId = profile?.id || '';
  const adminId = ceramic?.did?.parent || '';

  const handleTrackChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTrack(e.target.value);
    },
    [],
  );

  const handleTrackKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (track) {
          setValue('tracks', [...(tracks || []), track]);
          setTrack('');
        }
      }
    },
    [setValue, track, tracks],
  );

  const handleTrackRemove = useCallback(
    (track: string) => {
      setValue(
        'tracks',
        (tracks || []).filter((item) => item !== track),
      );
    },
    [setValue, tracks],
  );

  const handleDescriptionChange = useCallback(
    (val: any) => {
      descriptionEditorStore.setValue(val);
    },
    [descriptionEditorStore],
  );

  const handleAddSocialLink = useCallback(() => {
    append({ title: '', links: '' });
  }, [append]);

  const onFormSubmit = useCallback(
    async (data: FormData) => {
      if (
        !descriptionEditorStore.value ||
        !descriptionEditorStore.value.blocks ||
        descriptionEditorStore.value.blocks.length == 0
      ) {
        setError('description', {
          message: 'Description is required',
        });
        window.alert('Description is required');
        return;
      }
      try {
        const {
          startTime,
          endTime,
          socialLinks,
          isPerson,
          timezone,
          tracks,
          locations,
          imageUrl,
          externalUrl,
        } = data;
        setBlockClickModal(true);
        setLoading(true);
        const eventCreationInput: CreateEventRequest = {
          ...data,
          strDesc: descriptionEditorStore.getValueString(),
          spaceId,
          profileId,
          imageUrl:
            imageUrl ||
            'https://bafkreifje7spdjm5tqts5ybraurrqp4u6ztabbpefp4kepyzcy5sk2uel4.ipfs.nftstorage.link',
          startTime: startTime.format('YYYY-MM-DDTHH:mm:ss[Z]'),
          endTime: endTime.format('YYYY-MM-DDTHH:mm:ss[Z]'),
          socialLinks: socialLinks ?? [],
          adminId,
          person: isPerson!,
          timezone: timezone?.value ? timezone.value : dayjs.tz.guess(),
          tracks: tracks || [],
          locations: locations || [],
          externalUrl: externalUrl || 'TBD',
        };

        const response = await createEventKeySupa(eventCreationInput);
        if (response.status === 200) {
          const urlName = covertNameToUrlName(data.name);
          await createUrl(urlName, response.data.data.eventId, 'events');
          setShowModal(true);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        setBlockClickModal(false);
      }
    },
    [adminId, descriptionEditorStore, profileId, setError, spaceId],
  );

  const onFormError = useCallback(() => {
    window.alert('Please input all necessary fields.');
  }, []);

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
      <Box>
        <FormHeader title="Create Event" handleClose={handleClose} />
        <Box display="flex" flexDirection="column" gap="20px" padding={3}>
          <Box bgcolor="#262626" borderRadius="10px">
            <Stack padding="20px 20px 0" gap="10px">
              <FormTitle>Event Details</FormTitle>
              <Typography fontSize={14} lineHeight={1.6} sx={{ opacity: 0.6 }}>
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
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </Stack>
              <Stack spacing="10px">
                <FormLabel>Event Description*</FormLabel>
                <FormLabelDesc>
                  This is a description greeting for new members. You can also
                  update descriptions.
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
        <Box display="flex" flexDirection="column" gap="20px" padding={3}>
          <Box bgcolor="#262626" borderRadius="10px">
            <Stack padding="20px 20px 0" gap="10px">
              <FormTitle>Date & Time</FormTitle>
              <Typography fontSize={14} lineHeight={1.6} sx={{ opacity: 0.6 }}>
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
                <ZuSwitch />
                <Typography fontSize={16} lineHeight={1.2} fontWeight={600}>
                  All Day
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" gap="20px">
                <Stack flex={1} spacing="10px">
                  <FormLabel>Start Date*</FormLabel>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <DesktopDatePicker {...field} />
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </>
                    )}
                  />
                </Stack>
                <Stack flex={1} spacing="10px">
                  <FormLabel>End Date*</FormLabel>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <DesktopDatePicker {...field} />
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </>
                    )}
                  />
                </Stack>
              </Box>
              <Box display="flex" justifyContent="space-between" gap="20px">
                <Stack flex={1} spacing="10px">
                  <FormLabel>Start Time*</FormLabel>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <TimePicker {...field} />
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
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
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </>
                    )}
                  />
                </Stack>
              </Box>
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
            </Box>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap="20px" padding={3}>
          <Box bgcolor="#262626" borderRadius="10px">
            <Stack padding="20px 20px 0" gap="10px">
              <FormTitle>Format & Location</FormTitle>
              <Typography fontSize={14} lineHeight={1.6} sx={{ opacity: 0.6 }}>
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
                  },
                  {
                    title: 'Online',
                    desc: 'This is a virtual event',
                  },
                  {
                    title: 'Hybrid',
                    desc: 'Both In-Person & Online',
                  },
                ].map((item, index) => (
                  <FormatCheckbox
                    key={`FormatCheckbox-${index}`}
                    checked={false}
                    handleChange={() => {}}
                    title={item.title}
                    desc={item.desc}
                  />
                ))}
              </Box>
              <Stack spacing="10px">
                <FormLabel>Location Name*</FormLabel>
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
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </Stack>
              <Stack spacing="10px">
                <FormLabel>Location URL*</FormLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <ZuInput
                        {...field}
                        placeholder="https://"
                        error={!!error}
                      />
                      {error && (
                        <FormHelperText error>{error.message}</FormHelperText>
                      )}
                    </>
                  )}
                />
              </Stack>
            </Box>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap="20px" padding={3}>
          <FormFooter
            confirmText="Create Event"
            disabled={isLoading}
            handleClose={handleClose}
            handleConfirm={handleSubmit(onFormSubmit, onFormError)}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateEventForm;
