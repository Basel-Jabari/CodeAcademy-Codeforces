import React, {ReactElement} from 'react';
import styled from 'styled-components';
import LoadingIndicator from './LoadingIndicator';
import {images} from '../../assets';
import theme from '../../theme';

interface Props {
  isLoading: boolean;
  onClick: Function;
}

const StyledButton = styled.div<Props>`
  padding: 2px;
  width: 150px;
  height: 38px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background: ${(props) =>
    props.isLoading
      ? theme.surface
      : `linear-gradient(135deg, ${theme.accentDeep}, ${theme.accent})`};
  border: 1px solid ${(props) => (props.isLoading ? theme.border : theme.accent)};
  box-shadow: ${(props) =>
    props.isLoading ? 'none' : `0 0 18px ${theme.glow}`};
  color: white;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
  cursor: ${(props) => (props.isLoading ? 'default' : 'pointer')};
  transition-duration: 0.3s;

  &:hover {
    box-shadow: ${(props) =>
      props.isLoading ? 'none' : `0 0 28px ${theme.glow}`};
    border-color: ${(props) =>
      props.isLoading ? theme.border : theme.accentBright};
  }
`;

const LoopIcon = images.loopIcon;
const StyledLoopIcon = styled(LoopIcon)`
  height: 22px;
  width: 22px;
  fill: white;
`;

const RandomizeButton: React.FC<Props> = (props: Props): ReactElement => {
  return (
    <StyledButton
      isLoading={props.isLoading}
      onClick={() => {
        if (props.isLoading) return;
        props.onClick();
      }}
    >
      {props.isLoading ? (
        <LoadingIndicator></LoadingIndicator>
      ) : (
        <React.Fragment>
          <StyledLoopIcon></StyledLoopIcon>
          <div>Randomize</div>
        </React.Fragment>
      )}
    </StyledButton>
  );
};

RandomizeButton.defaultProps = {
  isLoading: false,
};

export default RandomizeButton;
