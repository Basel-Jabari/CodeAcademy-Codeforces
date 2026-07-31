import {
  ExprType,
  isExprType,
  isRootMode,
  RootMode,
  TagNode,
} from "../models/TagExpression";

let nextNodeId: number = 1;

function makeNodeId(): string {
  const id: string = `node-${nextNodeId}`;
  nextNodeId++;
  return id;
}

export function createTagNode(tag: string): TagNode {
  return { id: makeNodeId(), type: "tag", tag: tag, children: [] };
}

export function createExprNode(
  type: ExprType,
  children: TagNode[] = [],
): TagNode {
  return { id: makeNodeId(), type: type, children: children };
}

export function createRootNode(
  mode: RootMode = "LOOSE",
  children: TagNode[] = [],
): TagNode {
  return { id: makeNodeId(), type: mode, children: children };
}

export function createDefaultExpression(): TagNode {
  return createRootNode("LOOSE");
}

// gives every node in an imported/pasted tree a fresh id so it can't collide
// with ids already used elsewhere in the app
export function regenerateNodeIds(node: TagNode): TagNode {
  return {
    ...node,
    id: makeNodeId(),
    children: node.children.map(regenerateNodeIds),
  };
}

export function findNode(root: TagNode, id: string): TagNode | null {
  if (root.id === id) return root;

  for (const child of root.children) {
    const found: TagNode | null = findNode(child, id);
    if (found !== null) return found;
  }

  return null;
}

interface DetachResult {
  tree: TagNode;
  removed: TagNode | null;
}

function detachNode(root: TagNode, id: string): DetachResult {
  const children: TagNode[] = [];
  let removed: TagNode | null = null;

  for (const child of root.children) {
    if (child.id === id) {
      removed = child;
      continue;
    }

    const result: DetachResult = detachNode(child, id);
    children.push(result.tree);
    if (result.removed !== null) removed = result.removed;
  }

  return { tree: { ...root, children: children }, removed: removed };
}

export function removeNode(root: TagNode, id: string): TagNode {
  if (root.id === id) return root;
  return detachNode(root, id).tree;
}

function appendOrInsert(
  children: TagNode[],
  node: TagNode,
  beforeId?: string,
): TagNode[] {
  const next: TagNode[] = [];
  let inserted: boolean = false;

  for (const child of children) {
    if (!inserted && beforeId !== undefined && child.id === beforeId) {
      next.push(node);
      inserted = true;
    }
    next.push(child);
  }

  if (!inserted) next.push(node);
  return next;
}

// NOT holds exactly one child: a new drop replaces whatever was there
export function insertNode(
  root: TagNode,
  groupId: string,
  node: TagNode,
  beforeId?: string,
): TagNode {
  if (root.id === groupId) {
    if (root.type === "NOT") {
      return { ...root, children: [node] };
    }

    return {
      ...root,
      children: appendOrInsert(root.children, node, beforeId),
    };
  }

  return {
    ...root,
    children: root.children.map((child: TagNode) =>
      insertNode(child, groupId, node, beforeId),
    ),
  };
}

export function moveNode(
  root: TagNode,
  nodeId: string,
  groupId: string,
  beforeId?: string,
): TagNode {
  if (nodeId === groupId || nodeId === beforeId) return root;

  const node: TagNode | null = findNode(root, nodeId);
  if (node === null || node.id === root.id) return root;
  if (isRootMode(node.type)) return root;

  // a group cannot be dropped inside itself
  if (findNode(node, groupId) !== null) return root;

  const detached: DetachResult = detachNode(root, nodeId);
  if (detached.removed === null) return root;

  return insertNode(detached.tree, groupId, detached.removed, beforeId);
}

export function setRootMode(root: TagNode, mode: RootMode): TagNode {
  if (!isRootMode(root.type)) return root;
  return { ...root, type: mode };
}

export function collectTags(node: TagNode): string[] {
  if (node.type === "tag") return node.tag ? [node.tag] : [];

  const tags: string[] = [];
  node.children.forEach((child: TagNode) => {
    collectTags(child).forEach((tag: string) => {
      if (tags.indexOf(tag) === -1) tags.push(tag);
    });
  });

  return tags;
}

export function countTags(node: TagNode): number {
  return collectTags(node).length;
}

function evaluateBody(node: TagNode, problemTags: Set<string>): boolean {
  if (node.type === "tag") {
    return node.tag ? problemTags.has(node.tag) : true;
  }

  // empty group adds no condition
  if (node.children.length === 0) return true;

  // root children are combined with AND
  if (isRootMode(node.type) || node.type === "AND") {
    return node.children.every((child: TagNode) =>
      evaluateBody(child, problemTags),
    );
  }

  if (node.type === "OR") {
    return node.children.some((child: TagNode) =>
      evaluateBody(child, problemTags),
    );
  }

  // same as OR, except zero matching children is also accepted
  if (node.type === "OPTIONAL") {
    return true;
  }

  if (node.type === "XOR") {
    const matching: TagNode[] = node.children.filter((child: TagNode) =>
      evaluateBody(child, problemTags),
    );
    return matching.length === 1;
  }

  // NOT: exactly one child; that child must not match
  if (node.type === "NOT") {
    if (node.children.length === 0) return true;
    return !evaluateBody(node.children[0], problemTags);
  }

  return true;
}

export function evaluateExpression(
  node: TagNode,
  problemTags: Set<string>,
): boolean {
  if (!evaluateBody(node, problemTags)) return false;

  // LOOSE (and any non-root call) stops here
  if (!isRootMode(node.type) || node.type === "LOOSE") return true;

  // STRICT: every tag on the problem must appear in the expression
  const allowed: string[] = collectTags(node);
  let hasExtra: boolean = false;
  problemTags.forEach((tag: string) => {
    if (allowed.indexOf(tag) === -1) hasExtra = true;
  });

  return !hasExtra;
}

function needsBrackets(node: TagNode): boolean {
  if (node.type === "tag") return false;
  if (node.type === "NOT") return true;
  return node.children.length > 1;
}

function bodyToString(node: TagNode): string {
  if (node.type === "tag") return node.tag || "";

  const parts: string[] = [];
  node.children.forEach((child: TagNode) => {
    const text: string = bodyToString(child);
    if (text.length === 0) return;
    parts.push(needsBrackets(child) ? `(${text})` : text);
  });

  if (parts.length === 0) return "";

  if (node.type === "NOT") {
    return `NOT ${parts[0]}`;
  }

  // root and AND share the same join word in the written form
  const join: string =
    isRootMode(node.type) || node.type === "AND" ? "AND" : node.type;

  return parts.join(` ${join} `);
}

export function expressionToString(node: TagNode): string {
  const body: string = bodyToString(node);
  if (!isRootMode(node.type)) return body;

  if (body.length === 0) return `${node.type}:`;
  return `${node.type}: ${body}`;
}

export function findContradiction(node: TagNode): string | null {
  if (node.type === "tag") return null;

  if (node.type === "NOT" && node.children.length > 1) {
    return "NOT accepts exactly one expression inside it.";
  }

  if (isRootMode(node.type) || node.type === "AND") {
    const positives: string[] = [];
    node.children.forEach((child: TagNode) => {
      if (child.type === "tag" && child.tag) positives.push(child.tag);
    });

    for (const child of node.children) {
      if (child.type !== "NOT") continue;
      const blocked: string[] = collectTags(child);
      const clash: string | undefined = blocked.filter(
        (tag: string) => positives.indexOf(tag) !== -1,
      )[0];
      if (clash !== undefined) {
        return `"${clash}" is required and excluded in the same group.`;
      }
    }
  }

  for (const child of node.children) {
    const found: string | null = findContradiction(child);
    if (found !== null) return found;
  }

  return null;
}

export function connectorLabel(type: TagNode["type"]): string | null {
  if (type === "AND" || isRootMode(type)) return "AND";
  if (type === "OR" || type === "XOR") return type;
  // shown as "OR" (in the OPTIONAL block's own yellow accent) since it behaves
  // like OR visually — the node itself is still an OPTIONAL type underneath
  if (type === "OPTIONAL") return "OR";
  return null;
}

export function isExprNode(node: TagNode): boolean {
  return isExprType(node.type);
}
