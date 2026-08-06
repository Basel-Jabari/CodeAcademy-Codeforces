import {
  createExprNode,
  createRootNode,
  createTagNode,
  evaluateExpression,
  expressionToString,
} from "./tagExpression";
import { parseExpressionText } from "./expressionParser";

describe("evaluateExpression — nested STRICT groups", () => {
  const expression = createRootNode("STRICT", [
    createExprNode("OR", [
      createTagNode("greedy"),
      createTagNode("brute force"),
    ]),
    createExprNode("AND", [
      createTagNode("data structures"),
      createTagNode("two pointers"),
    ]),
  ]);

  it("serializes to the expected form", () => {
    expect(expressionToString(expression)).toBe(
      "STRICT: (greedy OR brute force) AND (data structures AND two pointers)",
    );
  });

  it("rejects a problem that only has greedy + implementation", () => {
    expect(
      evaluateExpression(
        expression,
        new Set(["greedy", "implementation"]),
      ),
    ).toBe(false);
  });

  it("rejects when required AND tags are missing even if OR matches", () => {
    expect(
      evaluateExpression(expression, new Set(["brute force"])),
    ).toBe(false);
  });

  it("rejects STRICT matches that carry an extra tag", () => {
    expect(
      evaluateExpression(
        expression,
        new Set([
          "greedy",
          "data structures",
          "two pointers",
          "implementation",
        ]),
      ),
    ).toBe(false);
  });

  it("accepts an exact tag set that satisfies the body", () => {
    expect(
      evaluateExpression(
        expression,
        new Set(["greedy", "data structures", "two pointers"]),
      ),
    ).toBe(true);
  });

  it("round-trips through the text parser without changing meaning", () => {
    const parsed = parseExpressionText(expressionToString(expression));
    expect(parsed.error).toBeNull();
    expect(
      evaluateExpression(
        parsed.expression!,
        new Set(["greedy", "implementation"]),
      ),
    ).toBe(false);
    expect(
      evaluateExpression(
        parsed.expression!,
        new Set(["greedy", "data structures", "two pointers"]),
      ),
    ).toBe(true);
  });
});

describe("evaluateExpression — operator semantics", () => {
  it("XOR requires exactly one matching child", () => {
    const expression = createRootNode("LOOSE", [
      createExprNode("XOR", [
        createTagNode("dp"),
        createTagNode("greedy"),
        createTagNode("math"),
      ]),
    ]);

    expect(evaluateExpression(expression, new Set(["dp"]))).toBe(true);
    expect(evaluateExpression(expression, new Set(["dp", "greedy"]))).toBe(
      false,
    );
    expect(evaluateExpression(expression, new Set(["graphs"]))).toBe(false);
  });

  it("OPTIONAL always matches the body, but STRICT still forbids extra tags", () => {
    const expression = createRootNode("STRICT", [
      createTagNode("dp"),
      createExprNode("OPTIONAL", [createTagNode("geometry")]),
    ]);

    expect(evaluateExpression(expression, new Set(["dp"]))).toBe(true);
    expect(evaluateExpression(expression, new Set(["dp", "geometry"]))).toBe(
      true,
    );
    expect(
      evaluateExpression(expression, new Set(["dp", "implementation"])),
    ).toBe(false);
  });

  it("NOT excludes a tag", () => {
    const expression = createRootNode("LOOSE", [
      createTagNode("dp"),
      createExprNode("NOT", [createTagNode("geometry")]),
    ]);

    expect(evaluateExpression(expression, new Set(["dp"]))).toBe(true);
    expect(
      evaluateExpression(expression, new Set(["dp", "geometry"])),
    ).toBe(false);
  });
});
