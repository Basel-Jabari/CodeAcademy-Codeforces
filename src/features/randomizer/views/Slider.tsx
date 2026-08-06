import React, {ReactElement, useState} from 'react';
import {Range, getTrackBackground} from 'react-range';
import styled from 'styled-components';
import {minRating, maxRating} from '../../../lib/problems/domain/data';
import theme from '../../../lib/theme/theme';

const RATING_STEP = 100;

interface TrackProps {
  values: Array<number>;
  min: number;
  max: number;
}

interface SliderProps {
  minRating: number;
  maxRating: number;
  onChange: Function;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 250px;
  margin: 20px;
`;

const Track = styled.div<TrackProps>`
  background: ${(props) =>
    getTrackBackground({
      values: props.values,
      colors: [theme.border, theme.accent, theme.border],
      min: props.min,
      max: props.max,
    })};
  width: 100%;
  height: 2px;
  margin-bottom: 10px;
  box-shadow: 0 0 10px ${theme.glowSoft};
`;

const Thumb = styled.div<{index: number}>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${theme.surface};
  border: 2px solid ${(props) => (props.index === 0 ? theme.cyan : theme.accent)};
  box-shadow: 0 0 12px
    ${(props) => (props.index === 0 ? theme.cyanGlow : theme.glow)};
  height: 16px;
  width: 16px;
  border-radius: 16px;
  outline: none;
`;

const Indicator = styled.div<{isDragged: boolean}>`
  height: 8px;
  width: 8px;
  border-radius: 6px;
  background-color: ${(props) =>
    props.isDragged ? theme.accentBright : 'transparent'};
`;

const Label = styled.div`
  color: ${theme.textMuted};
  font-size: 14px;

  span {
    color: ${theme.accentBright};
    font-weight: 600;
  }
`;

const RatingValue = styled.span`
  cursor: pointer;
  border-bottom: 1px dashed transparent;

  &:hover {
    color: ${theme.cyan};
    border-bottom-color: ${theme.cyan};
  }
`;

const RatingInput = styled.input`
  box-sizing: border-box;
  width: 62px;
  padding: 1px 4px;
  color: ${theme.accentBright};
  background-color: ${theme.background};
  border: 1px solid ${theme.accent};
  border-radius: 5px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: center;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

type Edge = 'min' | 'max';

const Slider: React.FC<SliderProps> = (props: SliderProps): ReactElement => {
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
    const parsed: number = parseInt(draftValue, 10);
    if (!isNaN(parsed)) {
      const stepped: number = roundToStep(parsed);
      if (editing === 'min') {
        props.onChange({min: Math.min(stepped, values[1]), max: values[1]});
      } else {
        props.onChange({min: values[0], max: Math.max(stepped, values[0])});
      }
    }
    setEditing(null);
  };

  const cancelEdit = (): void => setEditing(null);

  return (
    <Container>
      <Range
        step={100}
        min={minRating}
        max={maxRating}
        values={values}
        onChange={(values) => props.onChange({min: values[0], max: values[1]})}
        renderTrack={({props, children}) => (
          <Track min={minRating} max={maxRating} values={values} {...props}>
            {children}
          </Track>
        )}
        renderThumb={({props, isDragged, index}) => {
          return (
            <Thumb {...props} index={index}>
              <Indicator isDragged={isDragged}></Indicator>
            </Thumb>
          );
        }}
      />
      <Label>
        Rating:{' '}
        {editing === 'min' ? (
          <RatingInput
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
          ></RatingInput>
        ) : (
          <RatingValue
            title="Click to type a custom minimum"
            onClick={() => startEditing('min')}
          >
            {values[0]}
          </RatingValue>
        )}{' '}
        -{' '}
        {editing === 'max' ? (
          <RatingInput
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
          ></RatingInput>
        ) : (
          <RatingValue
            title="Click to type a custom maximum"
            onClick={() => startEditing('max')}
          >
            {values[1]}
          </RatingValue>
        )}
      </Label>
    </Container>
  );
};

export default Slider;
