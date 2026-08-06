import { ExprType, RootMode, TagNode } from "../../models/TagExpression";
import { getTags } from "../../problems/domain/data";
import {
  createDefaultExpression,
  createExprNode,
  createRootNode,
  createTagNode,
} from "./tagExpression";

// longest tag first, so "dfs and similar" is one tag, not "dfs" AND "similar"
const knownTags: string[] = getTags()
  .slice()
  .sort((left: string, right: string) => right.length - left.length);

type OpValue = ExprType | RootMode;

type Token =
  | { kind: "tag"; value: string }
  | { kind: "op"; value: OpValue }
  | { kind: "open" }
  | { kind: "close" }
  | { kind: "colon" };

const wordCharacter: RegExp = /[A-Za-z0-9_-]/;

function isWordCharacter(character: string): boolean {
  return wordCharacter.test(character);
}

function matchTag(text: string, start: number): string | null {
  for (const tag of knownTags) {
    if (text.slice(start, start + tag.length) !== tag) continue;

    const after: number = start + tag.length;
    if (after < text.length && isWordCharacter(text.charAt(after))) continue;

    return tag;
  }

  return null;
}

function toOperator(word: string): OpValue | null {
  const upper: string = word.toUpperCase();
  if (upper === "AND") return "AND";
  if (upper === "OR") return "OR";
  if (upper === "XOR") return "XOR";
  if (upper === "NOT") return "NOT";
  if (upper === "OPTIONAL") return "OPTIONAL";
  if (upper === "STRICT") return "STRICT";
  if (upper === "LOOSE") return "LOOSE";
  return null;
}

function tokenize(input: string): Token[] {
  const text: string = input.replace(/\s+/g, " ").trim();
  const lower: string = text.toLowerCase();
  const tokens: Token[] = [];
  let index: number = 0;

  while (index < text.length) {
    const character: string = text.charAt(index);

    if (character === " ") {
      index++;
      continue;
    }

    if (character === "(" || character === "[") {
      tokens.push({ kind: "open" });
      index++;
      continue;
    }

    if (character === ")" || character === "]") {
      tokens.push({ kind: "close" });
      index++;
      continue;
    }

    if (character === ":") {
      tokens.push({ kind: "colon" });
      index++;
      continue;
    }

    if (character === "+" || character === ",") {
      tokens.push({ kind: "op", value: "AND" });
      index++;
      continue;
    }

    if (character === "&" || character === "|" || character === "^") {
      const operator: ExprType =
        character === "&" ? "AND" : character === "|" ? "OR" : "XOR";
      tokens.push({ kind: "op", value: operator });
      index++;
      if (text.charAt(index) === character) index++;
      continue;
    }

    if (character === "!" || character === "~") {
      tokens.push({ kind: "op", value: "NOT" });
      index++;
      continue;
    }

    const tag: string | null = matchTag(lower, index);
    if (tag !== null) {
      tokens.push({ kind: "tag", value: tag });
      index += tag.length;
      continue;
    }

    if (isWordCharacter(character)) {
      let end: number = index;
      while (end < text.length && isWordCharacter(text.charAt(end))) end++;

      const word: string = text.slice(index, end);
      const operator: OpValue | null = toOperator(word);
      if (operator === null)
        throw new Error(
          `"${word}" is not a Codeforces tag. Use the tags from the palette.`,
        );

      tokens.push({ kind: "op", value: operator });
      index = end;
      continue;
    }

    throw new Error(`Unexpected character "${character}".`);
  }

  return tokens;
}

// AND binds tighter than XOR, XOR tighter than OR, OR tighter than OPTIONAL
class Parser {
  private tokens: Token[];
  private index: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.index = 0;
  }

  public atEnd(): boolean {
    return this.index >= this.tokens.length;
  }

  private peek(): Token | null {
    return this.atEnd() ? null : this.tokens[this.index];
  }

  private isOperator(value: OpValue): boolean {
    const token: Token | null = this.peek();
    return token !== null && token.kind === "op" && token.value === value;
  }

  private isKind(kind: "open" | "close" | "colon"): boolean {
    const token: Token | null = this.peek();
    return token !== null && token.kind === kind;
  }

  private advance(): void {
    this.index++;
  }

  public parseOptional(): TagNode {
    const children: TagNode[] = [this.parseOr()];

    while (this.isOperator("OPTIONAL")) {
      this.advance();
      children.push(this.parseOr());
    }

    return children.length === 1
      ? children[0]
      : createExprNode("OPTIONAL", children);
  }

  private parseOr(): TagNode {
    const children: TagNode[] = [this.parseXor()];

    while (this.isOperator("OR")) {
      this.advance();
      children.push(this.parseXor());
    }

    return children.length === 1
      ? children[0]
      : createExprNode("OR", children);
  }

  private parseXor(): TagNode {
    const children: TagNode[] = [this.parseAnd()];

    while (this.isOperator("XOR")) {
      this.advance();
      children.push(this.parseAnd());
    }

    return children.length === 1
      ? children[0]
      : createExprNode("XOR", children);
  }

  private parseAnd(): TagNode {
    const children: TagNode[] = [this.parseUnary()];

    while (this.isOperator("AND")) {
      this.advance();
      children.push(this.parseUnary());
    }

    return children.length === 1
      ? children[0]
      : createExprNode("AND", children);
  }

  private parseUnary(): TagNode {
    if (this.isOperator("NOT")) {
      this.advance();
      return createExprNode("NOT", [this.parseUnary()]);
    }

    if (this.isOperator("OPTIONAL")) {
      this.advance();
      return createExprNode("OPTIONAL", [this.parseUnary()]);
    }

    return this.parsePrimary();
  }

  private parsePrimary(): TagNode {
    const token: Token | null = this.peek();

    if (token === null) throw new Error("The expression ends too early.");

    if (token.kind === "open") {
      this.advance();
      const node: TagNode = this.parseOptional();
      if (!this.isKind("close")) throw new Error("Missing a closing bracket.");
      this.advance();
      return node;
    }

    if (token.kind === "tag") {
      this.advance();
      return createTagNode(token.value);
    }

    if (token.kind === "close") throw new Error("Extra closing bracket.");
    if (token.kind === "colon") throw new Error('Unexpected ":".');

    throw new Error(`"${token.value}" needs a tag after it.`);
  }
}

function asRootChildren(node: TagNode): TagNode[] {
  // unwrap a top-level AND so root children are joined by the root itself
  if (node.type === "AND") return node.children;
  return [node];
}

export interface ParseResult {
  expression: TagNode | null;
  error: string | null;
}

export function parseExpressionText(text: string): ParseResult {
  try {
    const tokens: Token[] = tokenize(text);
    if (tokens.length === 0)
      return { expression: createDefaultExpression(), error: null };

    let mode: RootMode = "LOOSE";
    let start: number = 0;

    const first: Token = tokens[0];
    if (
      first.kind === "op" &&
      (first.value === "STRICT" || first.value === "LOOSE")
    ) {
      mode = first.value;
      start = 1;
      if (tokens[1] && tokens[1].kind === "colon") start = 2;
    }

    const bodyTokens: Token[] = tokens.slice(start);
    if (bodyTokens.length === 0)
      return { expression: createRootNode(mode), error: null };

    const parser: Parser = new Parser(bodyTokens);
    const parsed: TagNode = parser.parseOptional();

    if (!parser.atEnd())
      throw new Error("There is leftover text after the expression.");

    return {
      expression: createRootNode(mode, asRootChildren(parsed)),
      error: null,
    };
  } catch (e) {
    return { expression: null, error: e.message };
  }
}
