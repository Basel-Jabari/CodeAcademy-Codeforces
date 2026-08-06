// Root is STRICT or LOOSE. Everything under it is AND / OR / XOR / NOT / tag.
// STRICT: the body matches and the problem has no tags outside the expression.
// LOOSE: the body matches; other tags are fine.
export type RootMode = "STRICT" | "LOOSE";

export type ExprType = "AND" | "OR" | "XOR" | "NOT" | "OPTIONAL";

export type TagNodeType = "tag" | RootMode | ExprType;

export interface TagNode {
  id: string;
  type: TagNodeType;
  // set on leaves only
  tag?: string;
  // empty on leaves; NOT holds at most one child
  children: TagNode[];
}

export const rootModes: RootMode[] = ["STRICT", "LOOSE"];

export const exprTypes: ExprType[] = ["AND", "OR", "XOR", "NOT", "OPTIONAL"];

export const rootDescriptions: { [key in RootMode]: string } = {
  STRICT: "match the expression; no other tags allowed",
  LOOSE: "match the expression; other tags are fine",
};

export const exprDescriptions: { [key in ExprType]: string } = {
  AND: "every item inside must match",
  OR: "at least one item inside must match",
  XOR: "exactly one item inside may match",
  NOT: "the single item inside must not match",
  OPTIONAL: "like OR, but zero items inside may match too",
};

export function isRootMode(type: TagNodeType): type is RootMode {
  return type === "STRICT" || type === "LOOSE";
}

export function isExprType(type: TagNodeType): type is ExprType {
  return (
    type === "AND" ||
    type === "OR" ||
    type === "XOR" ||
    type === "NOT" ||
    type === "OPTIONAL"
  );
}
