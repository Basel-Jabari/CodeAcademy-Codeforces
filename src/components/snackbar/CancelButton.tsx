import React, {ReactElement} from 'react';
import styled from 'styled-components';
import theme from '../../theme';

interface Props {
  onClick: Function;
}

const StyleCancelButton = styled.div`
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-weight: bold;
  font-size: 13px;
  background-color: transparent;
  border: 1px solid ${theme.border};
  color: ${theme.textMuted};
  margin-left: 12px;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  border-radius: 12.5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    border-color: ${theme.borderBright};
    color: ${theme.text};
  }
`;

const CancelButton: React.FC<Props> = (props: Props): ReactElement => {
  return (
    <StyleCancelButton onClick={() => props.onClick()}>X</StyleCancelButton>
  );
};

export default CancelButton;
