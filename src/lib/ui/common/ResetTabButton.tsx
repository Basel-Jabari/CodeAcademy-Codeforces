import React, { ReactElement } from "react";
import OutlineButton from "./OutlineButton";

interface Props {
  onClick: () => void;
  title?: string;
}

const ResetTabButton: React.FC<Props> = (props: Props): ReactElement => (
  <OutlineButton
    type="button"
    onClick={props.onClick}
    title={
      props.title ||
      "Clear this tab's filters, inputs, and results (cannot be undone)"
    }
  >
    Reset tab
  </OutlineButton>
);

export default ResetTabButton;
