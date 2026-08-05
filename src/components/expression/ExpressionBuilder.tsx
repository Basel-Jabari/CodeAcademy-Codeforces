'use client';

import React, { useState } from 'react';

import ExpressionNode, { DragPayload, DropTarget } from '@/components/expression/ExpressionNode';
import {
  ExprType,
  exprDescriptions,
  exprTypes,
  TagNode,
} from '@/types/TagExpression';
import { getTags } from '@/utils/data';
import { ParseResult, parseExpressionText } from '@/utils/expressionParser';
import {
  collectTags,
  createDefaultExpression,
  createExprNode,
  createRootNode,
  createTagNode,
  expressionToString,
  findContradiction,
  insertNode,
  moveNode,
  removeNode,
  setRootMode,
} from '@/utils/tagExpression';

import styles from './ExpressionBuilder.module.css';

interface Props {
  expression: TagNode;
  onChange: (expression: TagNode) => void;
}

const blockAccents: Record<ExprType, string> = {
  AND: '#3d9bff',
  OR: '#22d3ee',
  XOR: '#2ee6a8',
  NOT: '#ff4d6d',
  OPTIONAL: '#ffb84d',
};

const allTags = getTags();

export default function ExpressionBuilder({ expression, onChange }: Props) {
  const [dragItem, setDragItem] = useState<DragPayload | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const displayedText = isEditingText ? textInput : expressionToString(expression);
  const filteredTags = allTags.filter((t) => t.toLowerCase().includes(filter.toLowerCase()));
  const activeTags = collectTags(expression);
  const contradiction = findContradiction(expression);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    setIsEditingText(true);
    setParseError(null);
  };

  const handleTextBlur = () => {
    commitTextParse();
  };

  const commitTextParse = () => {
    if (!isEditingText) return;
    const res: ParseResult = parseExpressionText(textInput, expression.type);
    if (res.error) {
      setParseError(res.error);
    } else if (res.expression) {
      onChange(res.expression);
      setIsEditingText(false);
      setParseError(null);
    }
  };

  const startDrag = (event: React.DragEvent, payload: DragPayload): void => {
    setDragItem(payload);
    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
  };

  const endDrag = (): void => {
    setDragItem(null);
    setHover(null);
  };

  const executeDrop = (target: DropTarget): void => {
    if (!dragItem) return;

    if (dragItem.kind === 'newTag') {
      const leaf = createTagNode(dragItem.tag);
      onChange(insertNode(expression, target.groupId, leaf, target.beforeId));
    } else if (dragItem.kind === 'newGroup') {
      const group = createExprNode(dragItem.groupType, []);
      onChange(insertNode(expression, target.groupId, group, target.beforeId));
    } else if (dragItem.kind === 'move') {
      onChange(moveNode(expression, dragItem.nodeId, target.groupId, target.beforeId));
    }

    endDrag();
  };

  const handleRemove = (nodeId: string): void => {
    const next = removeNode(expression, nodeId);
    onChange(next ?? createDefaultExpression());
  };

  const handleClear = (): void => {
    onChange(createDefaultExpression());
    setIsEditingText(false);
    setParseError(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.title}>Tag Filter Expression</div>
        <span className={styles.count}>
          {activeTags.length} active {activeTags.length === 1 ? 'tag' : 'tags'}
        </span>
      </div>

      <div className={styles.hint}>
        Combine problem tags with logical blocks (AND, OR, NOT). Drag blocks or tags into the tree.
      </div>

      <div className={styles.editorRow}>
        <input
          className={`${styles.expressionInput} ${isEditingText ? styles.expressionInputEdited : ''}`}
          type="text"
          placeholder="e.g. dp AND (math OR greedy)"
          value={displayedText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === 'Enter') commitTextParse();
            if (event.key === 'Escape') {
              setIsEditingText(false);
              setParseError(null);
            }
          }}
        />
        <button
          type="button"
          style={{
            padding: '7px 14px',
            color: '#8595b4',
            backgroundColor: 'transparent',
            border: '1px solid #1e2c4a',
            borderRadius: '6px',
            font: 'inherit',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={handleClear}
        >
          Reset
        </button>
      </div>

      {parseError && <div className={styles.warning}>Parse error: {parseError}</div>}
      {contradiction && <div className={styles.warning}>Notice: {contradiction}</div>}

      <div className={styles.sectionLabel}>Add Logic Blocks</div>
      <div className={styles.blockRow}>
        {exprTypes.map((type) => (
          <div
            key={type}
            className={styles.block}
            style={{ color: blockAccents[type] }}
            draggable
            title={exprDescriptions[type]}
            onDragStart={(event: React.DragEvent) => startDrag(event, { kind: 'newGroup', groupType: type })}
            onDragEnd={endDrag}
          >
            + {type}
          </div>
        ))}
      </div>

      <div className={styles.sectionLabel}>Tag Palette</div>
      <input
        className={styles.expressionInput}
        style={{ marginBottom: '8px' }}
        type="text"
        placeholder="Filter tags..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className={styles.paletteRow}>
        {filteredTags.map((tag) => (
          <div
            key={tag}
            className={styles.tagPill}
            draggable
            onDragStart={(event: React.DragEvent) => startDrag(event, { kind: 'newTag', tag })}
            onDragEnd={endDrag}
          >
            + {tag}
          </div>
        ))}
      </div>

      <div className={styles.sectionLabel}>Expression Tree</div>
      <div className={styles.treeContainer}>
        <ExpressionNode
          node={expression}
          isRoot
          hover={hover}
          onDragNode={(nodeId) => setDragItem({ kind: 'move', nodeId })}
          onDragEnd={endDrag}
          onHover={setHover}
          onDropAt={executeDrop}
          onRemove={handleRemove}
          onSetRootMode={(mode) => onChange(setRootMode(expression, mode))}
        />
      </div>
    </div>
  );
}
