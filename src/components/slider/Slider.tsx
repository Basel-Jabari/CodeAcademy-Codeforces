'use client';

import { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

import { minRating, maxRating } from '@/utils/data';

import styles from './Slider.module.css';

const RATING_STEP = 100;

interface SliderProps {
  minRating: number;
  maxRating: number;
  onChange: (range: { min: number; max: number }) => void;
}

type Edge = 'min' | 'max';

export default function Slider(props: SliderProps) {
  const values = [props.minRating, props.maxRating];
  const [editing, setEditing] = useState<Edge | null>(null);
  const [draftValue, setDraftValue] = useState<string>('');

  const roundToStep = (value: number): number => {
    const stepped = Math.round(value / RATING_STEP) * RATING_STEP;
    return Math.min(maxRating, Math.max(minRating, stepped));
  };

  const startEditing = (edge: Edge): void => {
    setEditing(edge);
    setDraftValue(String(edge === 'min' ? values[0] : values[1]));
  };

  const commitEdit = (): void => {
    if (editing === null) return;
    const parsed = parseInt(draftValue, 10);
    if (!isNaN(parsed)) {
      const stepped = roundToStep(parsed);
      if (editing === 'min') {
        props.onChange({ min: Math.min(stepped, values[1]), max: values[1] });
      } else {
        props.onChange({ min: values[0], max: Math.max(stepped, values[0]) });
      }
    }
    setEditing(null);
  };

  const cancelEdit = (): void => setEditing(null);

  return (
    <div className={styles.container}>
      <Range
        step={RATING_STEP}
        min={minRating}
        max={maxRating}
        values={values}
        onChange={(newValues) => props.onChange({ min: newValues[0], max: newValues[1] })}
        renderTrack={({ props: trackProps, children }) => (
          <div
            {...trackProps}
            className={styles.track}
            style={{
              ...trackProps.style,
              background: getTrackBackground({
                values,
                colors: ['#1e2c4a', '#3d9bff', '#1e2c4a'],
                min: minRating,
                max: maxRating,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props: thumbProps, isDragged, index }) => (
          <div
            {...thumbProps}
            key={index}
            className={`${styles.thumb} ${index === 0 ? styles.thumbMin : styles.thumbMax}`}
          >
            <div className={`${styles.indicator} ${isDragged ? styles.indicatorDragged : ''}`} />
          </div>
        )}
      />
      <div className={styles.label}>
        Rating:{' '}
        {editing === 'min' ? (
          <input
            className={styles.ratingInput}
            type="number"
            autoFocus
            min={minRating}
            max={maxRating}
            step={RATING_STEP}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitEdit();
              if (event.key === 'Escape') cancelEdit();
            }}
          />
        ) : (
          <span
            className={styles.ratingValue}
            title="Click to type a custom minimum"
            onClick={() => startEditing('min')}
          >
            {values[0]}
          </span>
        )}{' '}
        -{' '}
        {editing === 'max' ? (
          <input
            className={styles.ratingInput}
            type="number"
            autoFocus
            min={minRating}
            max={maxRating}
            step={RATING_STEP}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitEdit();
              if (event.key === 'Escape') cancelEdit();
            }}
          />
        ) : (
          <span
            className={styles.ratingValue}
            title="Click to type a custom maximum"
            onClick={() => startEditing('max')}
          >
            {values[1]}
          </span>
        )}
      </div>
    </div>
  );
}
