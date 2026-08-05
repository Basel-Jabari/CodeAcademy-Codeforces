'use client';

import React, { useRef, useState } from 'react';

import OutlineButton from '@/components/common/OutlineButton';
import RandomizeButton from '@/components/randomize-button/RandomizeButton';
import Slider from '@/components/slider/Slider';
import { parseHandles } from '@/services/submissions';
import { minRating, maxRating } from '@/utils/data';
import { formatHandleList, parseHandleList, readFileAsText } from '@/utils/handleList';

import styles from './Options.module.css';

interface Props {
  onRandomize: (rating: { min: number; max: number }) => Promise<void> | void;
  participantHandles: string;
  onParticipantHandlesChange: (handles: string) => void;
  onError: (message: string) => void;
}

export default function Options(props: Props) {
  const [rating, setRating] = useState<{ min: number; max: number }>({
    min: minRating,
    max: maxRating,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsedHandles = parseHandles(props.participantHandles);
  const handleCount = parsedHandles.length;

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onParticipantHandlesChange(event.target.value);
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const content = await readFileAsText(files[0]);
      const importedHandles = parseHandleList(content);
      const updatedList = Array.from(new Set([...parsedHandles, ...importedHandles]));
      props.onParticipantHandlesChange(formatHandleList(updatedList));
    } catch (e: unknown) {
      const err = e as Error;
      props.onError(err.message || 'Failed to read file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRandomizeClick = async () => {
    setIsLoading(true);
    try {
      await props.onRandomize(rating);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>Options</div>

      <Slider
        minRating={rating.min}
        maxRating={rating.max}
        onChange={(newRating) => setRating(newRating)}
      />

      <div className={styles.handlesContainer}>
        <div className={styles.handlesHeader}>
          <label className={styles.handlesLabel} htmlFor="participant-handles">
            Exclude Solved Problems For (Codeforces Handles)
          </label>
          <span className={styles.handlesCount}>
            {handleCount} {handleCount === 1 ? 'handle' : 'handles'}
          </span>
        </div>

        <textarea
          id="participant-handles"
          className={styles.handlesInput}
          placeholder="e.g. Tourist, Petr, MikeMirzayanov (comma or newline separated)"
          value={props.participantHandles}
          onChange={handleTextareaChange}
        />

        <div className={styles.handlesActions}>
          <OutlineButton onClick={triggerImportClick}>Import Handles from File</OutlineButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            className={styles.hiddenFileInput}
            onChange={handleFileChange}
          />
        </div>

        <span className={styles.handlesHint}>
          Import a text file containing handle names (one per line or separated by commas). Duplicate
          handles will automatically be merged.
        </span>
      </div>

      <RandomizeButton isLoading={isLoading} onClick={handleRandomizeClick} />
    </div>
  );
}
