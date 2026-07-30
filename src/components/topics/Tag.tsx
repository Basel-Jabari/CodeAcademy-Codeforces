import React, { ReactElement } from "react";
import styled from "styled-components";
import theme from "../../theme";

interface Props {
  selected: boolean;
  content: string;
  onClick: (selected: boolean, topic: string) => void;
}

interface StyledProps {
  selected: boolean;
}

const StyledTag = styled.div<StyledProps>`
  background-color: ${(props) =>
    props.selected ? theme.accentDeep : "transparent"};
  border: 1px solid
    ${(props) => (props.selected ? theme.accent : theme.border)};
  box-shadow: ${(props) =>
    props.selected ? `0 0 12px ${theme.glow}` : "none"};
  color: ${(props) => (props.selected ? theme.accentBright : theme.textMuted)};
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  min-width: 70px;
  min-height: 30px;
  margin: 5px;
  user-select: none;
  cursor: pointer;
  transition-duration: 0.3s;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    border-color: ${theme.borderBright};
    color: ${theme.text};
  }
`;

const Tag: React.FC<Props> = (props: Props): ReactElement => {
  const selected: boolean = props.selected;
  const content: string = props.content;

  return (
    <StyledTag
      selected={props.selected}
      onClick={() => props.onClick(selected, content)}
    >
      <div style={{ margin: "5px" }}>{props.content}</div>
    </StyledTag>
  );
};

export default Tag;
