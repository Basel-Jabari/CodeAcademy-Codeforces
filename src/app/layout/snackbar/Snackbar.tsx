import React, { ReactElement, useEffect } from "react";
import styled from "styled-components";
import CancelButton from "./CancelButton";
import theme from "../../../lib/theme/theme";

interface SnackbarProps {
  visible: boolean;
  type?: string;
  content: string;
  onCancel: Function;
  timeout: number;
}

const StyledSnackbar = styled.div<SnackbarProps>`
  background-color: ${theme.surface};
  border: 1px solid
    ${(props) =>
      props.type === "error"
        ? theme.danger
        : props.type === "success"
          ? theme.success
          : theme.accent};
  box-shadow: 0 0 24px
    ${(props) =>
      props.type === "error"
        ? theme.dangerGlow
        : props.type === "success"
          ? theme.successGlow
          : theme.glow};
  color: ${(props) =>
    props.type === "error"
      ? theme.danger
      : props.type === "success"
        ? theme.success
        : theme.accent};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  position: fixed;
  bottom: ${(props) => (props.visible ? "2.5vh" : "0")};
  left: 0;
  right: 0;
  margin: auto;
  padding: 12px 18px;
  width: fit-content;
  max-width: min(520px, 88vw);
  min-height: 55px;
  box-sizing: border-box;
  border-radius: 14px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  transition-duration: 0.5s;
`;

const Snackbar: React.FC<SnackbarProps> = (
  props: SnackbarProps
): ReactElement => {
  const onCancel: Function = props.onCancel;
  const visible: boolean = props.visible;
  const timeout: number = props.timeout;

  useEffect(() => {
    if (visible) {
      const makeInvisible = setTimeout(() => onCancel(), timeout);
      return () => clearTimeout(makeInvisible);
    }
  }, [visible, onCancel, timeout]);

  return (
    <StyledSnackbar {...props}>
      <div style={{ flex: "5", lineHeight: 1.35 }}>{props.content}</div>
      <CancelButton onClick={onCancel}></CancelButton>
    </StyledSnackbar>
  );
};

Snackbar.defaultProps = {
  type: "error",
};

export default Snackbar;
