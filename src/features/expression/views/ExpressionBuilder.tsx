import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import {
  ExprType,
  exprDescriptions,
  exprTypes,
  TagNode,
} from "../../../lib/models/TagExpression";
import { getTags } from "../../../lib/problems/domain/data";
import {
  ParseResult,
  parseExpressionText,
} from "../../../lib/expression/domain/expressionParser";
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
} from "../../../lib/expression/domain/tagExpression";
import ExpressionNode, { DragPayload, DropTarget } from "./ExpressionNode";
import theme from "../../../lib/theme/theme";

interface Props {
  expression: TagNode;
  onChange: (expression: TagNode) => void;
}

const blockAccents: { [key in ExprType]: string } = {
  AND: theme.accent,
  OR: theme.cyan,
  XOR: theme.success,
  NOT: theme.danger,
  OPTIONAL: theme.warning,
};

const Card = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  background: linear-gradient(
    170deg,
    ${theme.surface} 0%,
    ${theme.background} 120%
  );
  border: 1px solid ${theme.border};
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.4), 0 0 26px ${theme.glowSoft};
`;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.accentBright};
`;

const Count = styled.span`
  font-size: 12px;
  color: ${theme.textMuted};
`;

const Hint = styled.div`
  margin: 8px 0 12px 0;
  font-size: 12px;
  line-height: 1.5;
  color: ${theme.textMuted};
`;

const EditorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
`;

const ExpressionInput = styled.input<{ $edited: boolean }>`
  box-sizing: border-box;
  flex: 1;
  min-width: 200px;
  padding: 11px 12px;
  font: inherit;
  font-size: 13px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid
    ${(props) => (props.$edited ? theme.accent : theme.borderBright)};
  border-left: 3px solid
    ${(props) => (props.$edited ? theme.accent : theme.cyan)};
  border-radius: 8px;
  transition: 0.2s;

  &::placeholder {
    color: ${theme.textMuted};
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 16px ${theme.glowSoft};
  }
`;

const Warning = styled.div`
  margin-bottom: 14px;
  padding: 9px 12px;
  font-size: 12px;
  color: ${theme.danger};
  background-color: rgba(255, 77, 109, 0.08);
  border: 1px solid rgba(255, 77, 109, 0.4);
  border-radius: 8px;
`;

const SectionLabel = styled.div`
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${theme.textMuted};
`;

const BlockRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
`;

const Block = styled.div<{ $accent: string }>`
  padding: 6px 12px;
  color: ${(props) => props.$accent};
  background-color: ${theme.background};
  border: 1px solid ${(props) => props.$accent};
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  cursor: grab;
  transition: 0.2s;

  &:hover {
    background-color: ${theme.glowSoft};
    box-shadow: 0 0 12px ${theme.glowSoft};
  }
`;

const TagSearch = styled.input`
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 10px;
  color: ${theme.text};
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font: inherit;
  font-size: 12px;

  &::placeholder {
    color: ${theme.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 12px ${theme.glowSoft};
  }
`;

const TagPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 148px;
  overflow-y: auto;
  padding: 8px;
  background-color: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 9px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.borderBright};
    border-radius: 4px;
  }
`;

const PaletteTag = styled.div<{ $used: boolean }>`
  padding: 4px 10px;
  color: ${(props) => (props.$used ? theme.accentBright : theme.textMuted)};
  background-color: ${(props) =>
    props.$used ? theme.accentDeep : "transparent"};
  border: 1px solid
    ${(props) => (props.$used ? theme.accent : theme.border)};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: grab;
  transition: 0.2s;

  &:hover {
    color: ${theme.text};
    border-color: ${theme.borderBright};
  }
`;

const TagEmpty = styled.div`
  padding: 6px;
  font-size: 12px;
  font-style: italic;
  color: ${theme.textMuted};
`;

const TreeWrap = styled.div`
  margin: 14px 0 12px 0;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const TextButton = styled.button`
  padding: 5px 11px;
  color: ${theme.textMuted};
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 6px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    color: ${theme.accentBright};
    border-color: ${theme.accent};
  }

  &:focus {
    outline: none;
  }
`;

const sortedTags: string[] = getTags()
  .slice()
  .sort((left: string, right: string) =>
    left.localeCompare(right, undefined, { sensitivity: "base" }),
  );

function buildExample(): TagNode {
  return createRootNode("STRICT", [
    createTagNode("dp"),
    createTagNode("implementation"),
    createExprNode("OR", [
      createTagNode("graphs"),
      createTagNode("number theory"),
    ]),
    createExprNode("NOT", [createTagNode("geometry")]),
  ]);
}

const ExpressionBuilder: React.FC<Props> = (props: Props): ReactElement => {
  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState<string>("");

  const expression: TagNode = props.expression;
  const usedTags: string[] = collectTags(expression);
  const preview: string = expressionToString(expression);
  const contradiction: string | null = findContradiction(expression);
  const text: string = draft === null ? preview : draft;

  const visibleTags: string[] = sortedTags.filter(
    (tag: string) =>
      tag.toLowerCase().indexOf(tagSearch.trim().toLowerCase()) !== -1,
  );

  const applyText = (): void => {
    const result: ParseResult = parseExpressionText(text);

    if (result.expression === null) {
      setParseError(result.error);
      return;
    }

    props.onChange(result.expression);
    setDraft(null);
    setParseError(null);
  };

  const changeExpression = (next: TagNode): void => {
    setDraft(null);
    setParseError(null);
    props.onChange(next);
  };

  const startDrag = (event: React.DragEvent, payload: DragPayload): void => {
    event.dataTransfer.setData("text/plain", "block");
    event.dataTransfer.effectAllowed = "move";
    setDrag(payload);
  };

  const endDrag = (): void => {
    setDrag(null);
    setHover(null);
  };

  const dropAt = (target: DropTarget): void => {
    if (drag === null) {
      setHover(null);
      return;
    }

    if (drag.kind === "newTag") {
      changeExpression(
        insertNode(
          expression,
          target.groupId,
          createTagNode(drag.tag),
          target.beforeId,
        ),
      );
    } else if (drag.kind === "newGroup") {
      changeExpression(
        insertNode(
          expression,
          target.groupId,
          createExprNode(drag.groupType),
          target.beforeId,
        ),
      );
    } else {
      changeExpression(
        moveNode(expression, drag.nodeId, target.groupId, target.beforeId),
      );
    }

    endDrag();
  };

  return (
    <Card>
      <Head>
        <Title>Tag expression</Title>
        <Count>
          {usedTags.length} {usedTags.length === 1 ? "tag" : "tags"} in use
        </Count>
      </Head>

      <Hint>
        Root is STRICT or LOOSE. Drag AND / OR / XOR / NOT / OPTIONAL and tags
        from the lists below into the box. Type the same expression in the
        text field — both stay in sync.
      </Hint>

      <EditorRow>
        <ExpressionInput
          $edited={draft !== null}
          spellCheck={false}
          placeholder="STRICT: dp AND (graphs OR number theory) AND (NOT geometry)"
          value={text}
          onChange={(event) => {
            setDraft(event.target.value);
            setParseError(null);
          }}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === "Enter") applyText();
            if (event.key === "Escape") {
              setDraft(null);
              setParseError(null);
            }
          }}
        ></ExpressionInput>

        {draft !== null ? (
          <React.Fragment>
            <TextButton type="button" onClick={applyText}>
              Apply
            </TextButton>
            <TextButton
              type="button"
              onClick={() => {
                setDraft(null);
                setParseError(null);
              }}
            >
              Cancel
            </TextButton>
          </React.Fragment>
        ) : null}
      </EditorRow>

      {parseError !== null ? <Warning>{parseError}</Warning> : null}
      {parseError === null && contradiction !== null ? (
        <Warning>{contradiction}</Warning>
      ) : null}

      <SectionLabel>Blocks — drag into the expression</SectionLabel>
      <BlockRow>
        {exprTypes.map((type: ExprType) => (
          <Block
            key={type}
            $accent={blockAccents[type]}
            draggable
            title={exprDescriptions[type]}
            onDragStart={(event: React.DragEvent) =>
              startDrag(event, { kind: "newGroup", groupType: type })
            }
            onDragEnd={endDrag}
          >
            {type}
          </Block>
        ))}
      </BlockRow>

      <SectionLabel>Tags — search, then click or drag</SectionLabel>
      <TagSearch
        placeholder="Search tags…"
        value={tagSearch}
        onChange={(event) => setTagSearch(event.target.value)}
      ></TagSearch>
      <TagPalette>
        {visibleTags.length === 0 ? (
          <TagEmpty>No tag matches the search.</TagEmpty>
        ) : (
          visibleTags.map((tag: string) => (
            <PaletteTag
              key={tag}
              $used={usedTags.indexOf(tag) !== -1}
              draggable
              title={`Add "${tag}"`}
              onDragStart={(event: React.DragEvent) =>
                startDrag(event, { kind: "newTag", tag: tag })
              }
              onDragEnd={endDrag}
              onClick={() =>
                changeExpression(
                  insertNode(expression, expression.id, createTagNode(tag)),
                )
              }
            >
              {tag}
            </PaletteTag>
          ))
        )}
      </TagPalette>

      <TreeWrap>
        <ExpressionNode
          node={expression}
          isRoot={true}
          hover={hover}
          onDragNode={(nodeId: string) =>
            setDrag({ kind: "move", nodeId: nodeId })
          }
          onDragEnd={endDrag}
          onHover={setHover}
          onDropAt={dropAt}
          onRemove={(nodeId: string) =>
            changeExpression(removeNode(expression, nodeId))
          }
          onSetRootMode={(mode) =>
            changeExpression(setRootMode(expression, mode))
          }
        ></ExpressionNode>
      </TreeWrap>

      <Actions>
        <TextButton
          type="button"
          onClick={() => changeExpression(createDefaultExpression())}
        >
          Clear expression
        </TextButton>
        <TextButton
          type="button"
          onClick={() => changeExpression(buildExample())}
        >
          Load example
        </TextButton>
      </Actions>
    </Card>
  );
};

export default ExpressionBuilder;
