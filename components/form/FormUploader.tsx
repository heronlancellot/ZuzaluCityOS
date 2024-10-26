import {
  Uploader3,
  Uploader3FileStatus,
  UploadFile,
  UploadResult,
} from '@lxdao/uploader3';
import { Box, Button } from '@mui/material';
import { PreviewFile } from '@/components';
import { useUploaderPreview } from '@/components/PreviewFile/useUploaderPreview';
import { useCallback, useEffect, useState } from 'react';

interface IProps {
  accept?: Array<'.png' | '.jpeg' | '.jpg' | '.gif' | '.svg'>;
  api?: string;
  multiple?: boolean;
  value?: string;
  previewStyle?: React.CSSProperties;
  onChange: (url: string | undefined) => void;
}

export default function FormUploader({
  accept = ['.gif', '.jpeg', '.gif', '.png'],
  api = '/api/file/upload',
  multiple = false,
  value,
  onChange,
  previewStyle,
}: IProps) {
  const avatarUploader = useUploaderPreview();
  const url = avatarUploader.getUrl();
  const [uploaded, setUploaded] = useState(false);

  const handleAvatarUpload = useCallback(
    (file: UploadResult | UploadFile) => {
      avatarUploader.setFile(file);
      setUploaded(true);
    },
    [avatarUploader],
  );

  useEffect(() => {
    if (value !== avatarUploader.getUrl()) {
      avatarUploader.setUrl(value);
    }
  }, [avatarUploader, value]);

  useEffect(() => {
    if (avatarUploader.file?.status === Uploader3FileStatus.done && uploaded) {
      url && onChange(url);
      setUploaded(false);
    }
  }, [url, avatarUploader.file?.status, uploaded, onChange]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Uploader3
        accept={accept}
        api={api}
        multiple={multiple}
        crop={{
          size: { width: 200, height: 200 },
          aspectRatio: 1,
        }}
        onUpload={handleAvatarUpload}
        onComplete={handleAvatarUpload}
      >
        <Button
          component="span"
          sx={{
            color: 'white',
            borderRadius: '10px',
            backgroundColor: '#373737',
            border: '1px solid #383838',
          }}
        >
          Upload Image
        </Button>
      </Uploader3>
      <PreviewFile
        sx={{
          width: '200px',
          height: '200px',
          borderRadius: '10px',
          ...previewStyle,
        }}
        src={avatarUploader.getUrl()}
        errorMessage={avatarUploader.errorMessage()}
        isLoading={avatarUploader.isLoading()}
      />
    </Box>
  );
}
