import styled from "styled-components";
import theme from "../../theme/theme";

const OutlineButton = styled.button`
  padding: 7px 14px;
  color: ${theme.textMuted};
  background-color: transparent;
  border: 1px solid ${theme.border};
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;

  &:hover:enabled {
    color: ${theme.accentBright};
    border-color: ${theme.accent};
    box-shadow: 0 0 14px ${theme.glowSoft};
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &:focus {
    outline: none;
  }
`;

export default OutlineButton;
