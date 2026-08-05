'use client';

import React from 'react';

import {
  ExprType,
  exprDescriptions,
  isRootMode,
  RootMode,
  rootDescriptions,
  TagNode,
} from '@/types/TagExpression';
import { connectorLabel } from '@/utils/tagExpression';

import styles from './ExpressionNode.module.css';

export type DragPayload =
  | { kind: 'newTag'; tag: string }
  | { kind: 'newGroup'; groupType: ExprType }
  | { kind: 'move'; nodeId: string };

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

const accents: Record<string, string> = {
  STRICT: '#ffb84d',
  LOOSE: '#3d9bff',
  AND: '#3d9bff',
  OR: '#22d3ee',
  XOR: '#2ee6a8',
  NOT: '#ff4d6d',
  OPTIONAL: '#ffb84d',
};

export default function ExpressionNode(props: Props) {
  const { node, isRoot, hover, onDragNode, onDragEnd, onHover, onDropAt, onRemove, onSetRootMode } = props;

  const stop = (event: React.DragEvent): void => {
    event.stopPropagation();
    event.preventDefault();
  };

  if (node.kind === 'leaf') {
    return (
      <div
        className={styles.tagLeaf}
        draggable
        onDragStart={(event: React.DragEvent) => {
          event.stopPropagation();
          onDragNode(node.id);
        }}
        onDragEnd={onDragEnd}
      >
        <span>{node.tag}</span>
        <span
          className={styles.leafRemove}
          title="Remove tag"
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            onRemove(node.id);
          }}
        >
          ×
        </span>
      </div>
    );
  }

  const isCurrentTarget = hover?.groupId === node.id;
  const isAppending = isCurrentTarget && hover?.beforeId === undefined;
  const children = node.children || [];
  const accent = accents[node.type] || '#3d9bff';

  return (
    <div
      className={`${styles.groupCard} ${isCurrentTarget ? styles.groupCardActive : ''}`}
      style={{
        borderColor: isCurrentTarget ? accent : '#1e2c4a',
        borderLeftColor: accent,
      }}
      draggable={!isRoot}
      onDragStart={(event: React.DragEvent) => {
        event.stopPropagation();
        onDragNode(node.id);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event: React.DragEvent) => {
        stop(event);
        onHover({ groupId: node.id });
      }}
      onDrop={(event: React.DragEvent) => {
        stop(event);
        onDropAt({ groupId: node.id });
      }}
    >
      <div className={styles.groupHeader}>
        {!isRoot && <span className={styles.grip}>⋮⋮</span>}

        {isRoot ? (
          <div className={styles.modeSwitch}>
            {(['LOOSE', 'STRICT'] as RootMode[]).map((mode) => {
              const active = node.type === mode;
              const modeAccent = accents[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.modeButton} ${active ? styles.modeButtonActive : ''}`}
                  style={{
                    backgroundColor: active ? modeAccent : 'transparent',
                    color: active ? '#070b14' : '#8595b4',
                  }}
                  onClick={() => onSetRootMode(mode)}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        ) : (
          <span className={styles.typeBadge} style={{ backgroundColor: accent, color: '#070b14' }}>
            {node.type}
          </span>
        )}

        <span className={styles.groupMeta}>
          {isRoot && isRootMode(node.type) ? rootDescriptions[node.type] : exprDescriptions[node.type as ExprType]}
        </span>

        {!isRoot && (
          <button
            type="button"
            className={styles.iconButton}
            title="Delete group"
            onClick={() => onRemove(node.id)}
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.groupBody}>
        {children.length === 0 && !isAppending && (
          <span className={styles.dropHint}>Drag tags or group blocks here</span>
        )}

        {children.map((child, index) => {
          const isBeforeMe = isCurrentTarget && hover?.beforeId === child.id;
          const connText = connectorLabel(node.type, index);

          return (
            <div key={child.id} className={styles.slot}>
              {isBeforeMe && (
                <span
                  className={styles.insertBar}
                  style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
                />
              )}

              {index > 0 && (
                <span className={styles.connector} style={{ color: accent }}>
                  {connText}
                </span>
              )}

              <div
                onDragOver={(event: React.DragEvent) => {
                  stop(event);
                  onHover({ groupId: node.id, beforeId: child.id });
                }}
                onDrop={(event: React.DragEvent) => {
                  stop(event);
                  onDropAt({ groupId: node.id, beforeId: child.id });
                }}
              >
                <ExpressionNode {...props} node={child} isRoot={false} />
              </div>
            </div>
          );
        })}

        {isAppending && (
          <span
            className={styles.insertBar}
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
          />
        )}
      </div>
    </div>
  );
}
