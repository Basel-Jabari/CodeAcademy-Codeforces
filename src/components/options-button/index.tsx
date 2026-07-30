import React from "react";
import styled from "styled-components";
import LogicalOperator from "../../models/LogicalOperator";
import theme from "../../theme";

const Button = styled.div<{ isSelected: boolean }>`
  width: 60px;
  padding: 4px 0;
  margin: 0 4px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
  transition: 0.3s;
  border-radius: 4px;
  color: ${(props) => (props.isSelected ? theme.accentBright : theme.textMuted)};
  background-color: ${(props) =>
    props.isSelected ? theme.accentDeep : theme.surface};
  border: 1px solid
    ${(props) => (props.isSelected ? theme.accent : theme.border)};
  box-shadow: ${(props) =>
    props.isSelected ? `0 0 12px ${theme.glow}` : "none"};

  &:hover {
    color: ${theme.text};
    border-color: ${theme.borderBright};
  }
`;

type OptionsButtonProps = {
  opertator: LogicalOperator;
  isSelected: boolean;
  onClick: (operator: LogicalOperator) => void;
};

const OptionsButton = ({
  opertator,
  isSelected,
  onClick,
}: OptionsButtonProps) => {
  return (
    <Button isSelected={isSelected} onClick={() => onClick(opertator)}>
      {opertator}
    </Button>
  );
};

export default OptionsButton;
