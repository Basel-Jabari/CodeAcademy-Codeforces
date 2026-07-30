import React, {ReactElement} from 'react';
import {Range, getTrackBackground} from 'react-range';
import styled from 'styled-components';
import {minRating, maxRating} from '../../services/data';
import theme from '../../theme';

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

const Slider: React.FC<SliderProps> = (props: SliderProps): ReactElement => {
  const values = [props.minRating, props.maxRating];
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
        Rating: <span>{values[0]}</span> - <span>{values[1]}</span>
      </Label>
    </Container>
  );
};

export default Slider;
