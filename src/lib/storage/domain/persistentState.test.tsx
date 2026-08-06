import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { usePersistentState } from "./persistentState";

const storageKey = "cfppu.v1.test.value";

const Harness: React.FC = () => {
  const [value, setValue] = usePersistentState<string>("test.value", "first");
  return <button onClick={() => setValue("second")}>{value}</button>;
};

function render(): HTMLButtonElement {
  act(() => {
    ReactDOM.render(<Harness />, container);
  });
  return container.querySelector("button") as HTMLButtonElement;
}

function click(button: HTMLButtonElement): void {
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

let container: HTMLDivElement;

describe("usePersistentState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
    jest.useRealTimers();
  });

  it("restores saved state after the component is fully remounted", () => {
    const button = render();
    expect(button.textContent).toBe("first");

    click(button);
    expect(button.textContent).toBe("second");

    act(() => {
      jest.runAllTimers();
    });
    expect(localStorage.getItem(storageKey)).toBe('"second"');

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    expect(render().textContent).toBe("second");
  });

  it("does not write anything until the value actually changes", () => {
    render();

    act(() => {
      jest.runAllTimers();
    });
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it("waits for a pause before writing, instead of writing per change", () => {
    const button = render();
    click(button);

    expect(localStorage.getItem(storageKey)).toBeNull();

    act(() => {
      jest.runAllTimers();
    });
    expect(localStorage.getItem(storageKey)).toBe('"second"');
  });

  it("saves a still-pending change when the component unmounts", () => {
    const button = render();
    click(button);
    expect(localStorage.getItem(storageKey)).toBeNull();

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    expect(localStorage.getItem(storageKey)).toBe('"second"');
  });

  it("saves a still-pending change when the page is hidden", () => {
    const button = render();
    click(button);
    expect(localStorage.getItem(storageKey)).toBeNull();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(localStorage.getItem(storageKey)).toBe('"second"');
  });
});
