import React, { ReactElement } from "react";
import styled from "styled-components";
import Row from "../common/Row";
import theme from "../../theme";

interface Props {
  onClick: Function;
  disabled: boolean;
}

const StyledButton = styled.div<Props>`
  width: 120px;
  height: 35px;
  margin: 15px;
  display: flex;
  visibility: ${(props) => (props.disabled ? "hidden" : "visible")};
  justify-content: space-evenly;
  align-items: center;
  background-color: transparent;
  border: 1px solid ${theme.danger};
  color: ${theme.danger};
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
  user-select: none;
  cursor: pointer;
  transition-duration: 0.3s;

  &:hover {
    background-color: ${theme.danger};
    box-shadow: 0 0 18px ${theme.dangerGlow};
    color: white;
  }
`;

const ClearButton: React.FC<Props> = (props: Props): ReactElement => {
  return (
    <Row>
      <StyledButton {...props} onClick={() => props.onClick()}>
        Clear
      </StyledButton>
    </Row>
  );
};

export default ClearButton;
