import React, { ReactElement } from "react";
import styled from "styled-components";
import {
  ExprType,
  exprDescriptions,
  isRootMode,
  RootMode,
  rootDescriptions,
  TagNode,
} from "../../models/TagExpression";
import { connectorLabel } from "../../services/tagExpression";
import theme from "../../theme";

export type DragPayload =
  | { kind: "newTag"; tag: string }
  | { kind: "newGroup"; groupType: ExprType }
  | { kind: "move"; nodeId: string };

export interface DropTarget {
  groupId: string;
  beforeId?: string;
}

interface Props {
  node: TagNode;
  isRoot: boolean;
  hover: DropTarget | null;
  onDragNode: (nodeId: string) => void;
  onDragEnd: () => void;
  onHover: (target: DropTarget | null) => void;
  onDropAt: (target: DropTarget) => void;
  onRemove: (nodeId: string) => void;
  onSetRootMode: (mode: RootMode) => void;
}

const accents: { [key: string]: string } = {
  STRICT: theme.warning,
  LOOSE: theme.accent,
  AND: theme.accent,
  OR: theme.cyan,
  XOR: theme.success,
  NOT: theme.danger,
  OPTIONAL: theme.warning,
};

const GroupCard = styled.div<{ $accent: string; $active: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  padding: 10px;
  border: 1px solid
    ${(props) => (props.$active ? props.$accent : theme.border)};
  border-left: 3px solid ${(props) => props.$accent};
  border-radius: 10px;
  background-color: ${(props) =>
    props.$active ? "rgba(61, 155, 255, 0.09)" : "rgba(7, 11, 20, 0.45)"};
  box-shadow: ${(props) =>
    props.$active ? `0 0 16px ${theme.glowSoft}` : "none"};
  transition: border-color 0.2s, background-color 0.2s;
`;

const GroupHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Grip = styled.span`
  color: ${theme.textMuted};
  font-size: 13px;
  letter-spacing: -1px;
  cursor: grab;
`;

const TypeBadge = styled.span<{ $accent: string }>`
  padding: 4px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${theme.background};
  background-color: ${(props) => props.$accent};
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 3px;
  padding: 2px;
  background-color: rgba(7, 11, 20, 0.7);
  border: 1px solid ${theme.border};
  border-radius: 7px;
`;

const ModeButton = styled.button<{ $active: boolean; $accent: string }>`
  padding: 4px 9px;
  border: none;
  border-radius: 5px;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: 0.2s;
  color: ${(props) => (props.$active ? theme.background : theme.textMuted)};
  background-color: ${(props) =>
    props.$active ? props.$accent : "transparent"};

  &:hover {
    color: ${(props) => (props.$active ? theme.background : theme.text)};
  }

  &:focus {
    outline: none;
  }
`;

const GroupMeta = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: ${theme.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconButton = styled.button`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  padding: 0;
  color: ${theme.textMuted};
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 5px;
  font: inherit;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    color: ${theme.danger};
    border-color: ${theme.danger};
  }

  &:focus {
    outline: none;
  }
`;

const GroupBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 4px;
  border: 1px dashed ${theme.border};
  border-radius: 8px;
`;

const Slot = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
`;

const InsertBar = styled.span<{ $accent: string }>`
  width: 3px;
  align-self: stretch;
  min-height: 22px;
  border-radius: 2px;
  background-color: ${(props) => props.$accent};
  box-shadow: 0 0 10px ${(props) => props.$accent};
`;

const Connector = styled.span<{ $accent: string }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${(props) => props.$accent};
`;

const TagLeaf = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 10px;
  color: ${theme.accentBright};
  background-color: ${theme.accentDeep};
  border: 1px solid ${theme.accent};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: grab;
`;

const LeafRemove = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
  color: ${theme.accentBright};
  background-color: rgba(7, 11, 20, 0.5);
  cursor: pointer;

  &:hover {
    color: white;
    background-color: ${theme.danger};
  }
`;

const DropHint = styled.span`
  padding: 0 6px;
  font-size: 11px;
  font-style: italic;
  color: ${theme.textMuted};
`;

const ExpressionNode: React.FC<Props> = (props: Props): ReactElement => {
  const node: TagNode = props.node;
  const accent: string = accents[node.type] || theme.accent;
  const isActiveTarget: boolean =
    props.hover !== null &&
    props.hover.groupId === node.id &&
    props.hover.beforeId === undefined;

  const description: string = isRootMode(node.type)
    ? rootDescriptions[node.type]
    : node.type === "tag"
    ? ""
    : exprDescriptions[node.type as ExprType];

  const stop = (event: React.DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  const dropHint: string =
    node.type === "NOT"
      ? "drop exactly one tag or block here"
      : "drop a tag or a block here";

  const renderLeaf = (child: TagNode): ReactElement => (
    <TagLeaf
      draggable
      title="Drag into another block, or click × to remove"
      onDragStart={(event: React.DragEvent) => {
        event.stopPropagation();
        event.dataTransfer.setData("text/plain", child.id);
        event.dataTransfer.effectAllowed = "move";
        props.onDragNode(child.id);
      }}
      onDragEnd={props.onDragEnd}
    >
      {child.tag}
      <LeafRemove
        title="Remove"
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          props.onRemove(child.id);
        }}
      >
        ×
      </LeafRemove>
    </TagLeaf>
  );

  return (
    <GroupCard
      $accent={accent}
      $active={isActiveTarget}
      onDragOver={(event: React.DragEvent) => {
        stop(event);
        event.dataTransfer.dropEffect = "move";
        props.onHover({ groupId: node.id });
      }}
      onDrop={(event: React.DragEvent) => {
        stop(event);
        props.onDropAt({ groupId: node.id });
      }}
    >
      <GroupHeader
        draggable={!props.isRoot}
        onDragStart={(event: React.DragEvent) => {
          if (props.isRoot) return;
          event.stopPropagation();
          event.dataTransfer.setData("text/plain", node.id);
          event.dataTransfer.effectAllowed = "move";
          props.onDragNode(node.id);
        }}
        onDragEnd={props.onDragEnd}
      >
        {props.isRoot ? null : <Grip title="Drag this whole block">⣿</Grip>}

        {props.isRoot ? (
          <ModeSwitch>
            <ModeButton
              type="button"
              $active={node.type === "STRICT"}
              $accent={accents.STRICT}
              title={rootDescriptions.STRICT}
              onClick={() => props.onSetRootMode("STRICT")}
            >
              STRICT
            </ModeButton>
            <ModeButton
              type="button"
              $active={node.type === "LOOSE"}
              $accent={accents.LOOSE}
              title={rootDescriptions.LOOSE}
              onClick={() => props.onSetRootMode("LOOSE")}
            >
              LOOSE
            </ModeButton>
          </ModeSwitch>
        ) : (
          <TypeBadge $accent={accent}>{node.type}</TypeBadge>
        )}

        <GroupMeta>{description}</GroupMeta>

        {props.isRoot ? null : (
          <IconButton
            type="button"
            title="Delete this block"
            onClick={() => props.onRemove(node.id)}
          >
            ×
          </IconButton>
        )}
      </GroupHeader>

      <GroupBody>
        {node.children.length === 0 ? <DropHint>{dropHint}</DropHint> : null}

        {node.children.map((child: TagNode, index: number) => {
          const showBar: boolean =
            props.hover !== null &&
            props.hover.groupId === node.id &&
            props.hover.beforeId === child.id;
          const join: string | null = connectorLabel(node.type);

          return (
            <Slot
              key={child.id}
              onDragOver={(event: React.DragEvent) => {
                stop(event);
                event.dataTransfer.dropEffect = "move";
                props.onHover({ groupId: node.id, beforeId: child.id });
              }}
              onDrop={(event: React.DragEvent) => {
                stop(event);
                props.onDropAt({ groupId: node.id, beforeId: child.id });
              }}
            >
              {showBar ? <InsertBar $accent={accent} /> : null}

              {index > 0 && join !== null ? (
                <Connector $accent={accent}>{join}</Connector>
              ) : null}

              {child.type === "tag" ? (
                renderLeaf(child)
              ) : (
                <ExpressionNode
                  node={child}
                  isRoot={false}
                  hover={props.hover}
                  onDragNode={props.onDragNode}
                  onDragEnd={props.onDragEnd}
                  onHover={props.onHover}
                  onDropAt={props.onDropAt}
                  onRemove={props.onRemove}
                  onSetRootMode={props.onSetRootMode}
                ></ExpressionNode>
              )}
            </Slot>
          );
        })}
      </GroupBody>
    </GroupCard>
  );
};

export default ExpressionNode;
