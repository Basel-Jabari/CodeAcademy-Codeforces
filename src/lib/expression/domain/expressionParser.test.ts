import { parseExpressionText } from "./expressionParser";
import {
  createExprNode,
  createRootNode,
  createTagNode,
  expressionToString,
} from "./tagExpression";
import { TagNode } from "../../models/TagExpression";

function parsedExpression(text: string): TagNode {
  const result = parseExpressionText(text);
  expect(result.error).toBeNull();
  expect(result.expression).not.toBeNull();
  return result.expression as TagNode;
}

describe("OPTIONAL expression syntax", () => {
  it("accepts OPTIONAL as a prefix for a single tag", () => {
    const expression = parsedExpression("OPTIONAL geometry");
    const optional = expression.children[0];

    expect(optional.type).toBe("OPTIONAL");
    expect(optional.children).toHaveLength(1);
    expect(optional.children[0].tag).toBe("geometry");
  });

  it("serializes a single-child OPTIONAL without dropping its keyword", () => {
    const expression = createRootNode("LOOSE", [
      createExprNode("OPTIONAL", [createTagNode("dp")]),
    ]);

    expect(expressionToString(expression)).toBe("LOOSE: OPTIONAL dp");

    const reparsed = parsedExpression(expressionToString(expression));
    expect(reparsed.children[0].type).toBe("OPTIONAL");
    expect(reparsed.children[0].children[0].tag).toBe("dp");
  });

  it("keeps the existing infix OPTIONAL form", () => {
    const expression = parsedExpression("graphs OPTIONAL trees");
    const optional = expression.children[0];

    expect(optional.type).toBe("OPTIONAL");
    expect(optional.children.map((child: TagNode) => child.tag)).toEqual([
      "graphs",
      "trees",
    ]);
    expect(expressionToString(expression)).toBe(
      "LOOSE: (graphs OPTIONAL trees)",
    );
  });

  it("supports a prefixed OPTIONAL inside a larger expression", () => {
    const expression = parsedExpression("dp AND (OPTIONAL geometry)");

    expect(expression.children).toHaveLength(2);
    expect(expression.children[0].tag).toBe("dp");
    expect(expression.children[1].type).toBe("OPTIONAL");
    expect(expression.children[1].children[0].tag).toBe("geometry");
  });

  it("does not regress NOT, OR, or root mode parsing", () => {
    const expression = parsedExpression(
      "STRICT: dp AND (graphs OR number theory) AND (NOT geometry)",
    );

    expect(expression.type).toBe("STRICT");
    expect(expression.children).toHaveLength(3);
    expect(expression.children[1].type).toBe("OR");
    expect(expression.children[2].type).toBe("NOT");
  });
});
