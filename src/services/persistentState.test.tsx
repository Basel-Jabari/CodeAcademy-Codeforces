import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { usePersistentState } from "./persistentState";

const Harness: React.FC = () => {
  const [value, setValue] = usePersistentState<string>("test.value", "first");
  return <button onClick={() => setValue("second")}>{value}</button>;
};

describe("usePersistentState", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  });

  it("restores saved state after the component is fully remounted", () => {
    act(() => {
      ReactDOM.render(<Harness />, container);
    });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.textContent).toBe("first");

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(button.textContent).toBe("second");
    expect(localStorage.getItem("cfppu.test.value")).toBe('"second"');

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    act(() => {
      ReactDOM.render(<Harness />, container);
    });
    expect(container.querySelector("button")!.textContent).toBe("second");
  });
});
