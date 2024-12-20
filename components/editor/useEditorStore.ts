import { OutputBlockData, OutputData } from '@editorjs/editorjs';
import { useRef, useState } from 'react';
import { once } from 'lodash';

export const decodeOutputData = (value: string | OutputData): OutputData => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value.replaceAll('\\"', '"')) as OutputData;
  } catch (e) {
    console.error('Failed to parse output data', e);
    return { time: 0, blocks: [] };
  }
};

export const encodeOutputData = (data: OutputData) => {
  if (!data) return JSON.stringify({});
  return JSON.stringify(data);
};

export const getOutputDataLength = (blocks?: OutputBlockData[]) => {
  if (Array.isArray(blocks) === false) return 0;
  return blocks
    .filter((block) => block.data && 'text' in block.data)
    .reduce((sum, current) => sum + current.data.text.length, 0);
};

export const useEditorStore = () => {
  const [value, setValue] = useState<OutputData>();
  const [length, setLength] = useState<number>(0);
  const initValue = useRef<OutputData>();

  /**
   * first call setValue will set the initial value
   */
  const onceSetFirstValue = once((value: OutputData) => {
    initValue.current = value;
  });

  return {
    value,
    getValueString: () => encodeOutputData(value!),
    setValue: (value: OutputData | string) => {
      const data = decodeOutputData(value);
      onceSetFirstValue(data);
      setValue(data);
      setLength(getOutputDataLength(data.blocks));
    },
    length,
    setLength,
    reset: () => {
      /**
       * reset the value to the initial value
       */
      const data = initValue.current;
      setValue(data);
      setLength(getOutputDataLength(data ? data.blocks : undefined));
    },
    clear: () => {
      setValue(undefined);
      setLength(0);
    },
  };
};
