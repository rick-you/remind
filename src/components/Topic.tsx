/** @jsx jsx */
import { useContext, KeyboardEvent, useState, DragEvent } from 'react';
import { ThemeContext } from '../context/theme';
import {
  MAX_TOPIC_WIDTH,
  TOPIC_RADIUS,
  TOPIC_FONT_SIZE,
  EDITOR_MODE,
  KEY_MAPS,
} from '../constant';
import { css, jsx } from '@emotion/core';
import { TopicData } from 'xmind-model/types/models/topic';
import * as rootStore from '../store/root';
import editorStore from '../store/editor';
import { debug } from '../utils/debug';
import { HierarchyPointNode } from 'd3-hierarchy';

const Topic = (props: HierarchyPointNode<TopicData>) => {
  const {
    data: { title, id },
    x,
    y,
    depth,
  } = props;
  const topicTheme = useContext(ThemeContext).topic;
  // const root = rootStore.useSelector(s => s);
  const editorState = editorStore.useSelector(s => s);
  const { mode, selectedNodeId } = editorState;
  const isSelected = id === selectedNodeId;
  const isEditing = isSelected && mode === EDITOR_MODE.edit;
  const [isDragEntering, setIsDragEntering] = useState(false);
  const hasBorder = depth <= 1;

  function selectNode() {
    editorStore.dispatch('SELECT_NODE', id);
  }

  // 编辑模式下
  function exitEditMode(e: KeyboardEvent<HTMLDivElement>) {
    if (
      [KEY_MAPS.Enter, KEY_MAPS.Escape].includes(e.key) &&
      mode === EDITOR_MODE.edit
    ) {
      editorStore.dispatch('SET_MODE', EDITOR_MODE.regular);
      rootStore.dispatch('UPDATE_NODE', {
        id,
        node: {
          title: e.currentTarget.innerText,
        },
      });
    }
  }

  function handleDragStart() {
    editorStore.dispatch('DRAG_NODE', props.data);
  }
  function handleDragEnter() {
    setIsDragEntering(true);
  }
  function handleDragLeave() {
    setIsDragEntering(false);
  }

  function handleDrop() {
    debug('handleDrop');
    rootStore.dispatch('DELETE_NODE', editorState.dragingNode?.id);
    rootStore.dispatch('APPEND_CHILD', {
      id,
      node: editorState.dragingNode,
    });
  }

  // We need to prevent the default behavior
  // of this event, in order for the onDrop
  // event to fire.
  // It may sound weird, but the default is
  // to cancel out the drop.
  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }
  const border = hasBorder ? `1px solid ${topicTheme.stroke}` : 'none';
  const outline = isSelected ? `2px solid ${topicTheme.borderColor}` : 'none';
  const background = hasBorder ? '#fff' : 'transparent';

  // preventDefault to prevent enter keyboard event create new html element
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ([KEY_MAPS.Enter].includes(e.key) && mode === EDITOR_MODE.edit) {
      e.preventDefault();
    }
  }

  const paddingOffset = depth * 3;
  const padding = `${10 - paddingOffset}px ${20 - paddingOffset}px`;
  const fontSizeOffset = depth * 4;
  const fontSize = `${Math.max(16, TOPIC_FONT_SIZE - fontSizeOffset)}px`;
  return (
    <div
      id={`topic-${id}`}
      contentEditable={isEditing}
      onClick={selectNode}
      onKeyUp={exitEditMode}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      css={css`
        display: inline-block;
        border-radius: ${TOPIC_RADIUS}px;
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(${x}px, ${y}px);
        background: ${background};
        max-width: ${MAX_TOPIC_WIDTH}px;
        padding: ${padding};
        font-size: ${fontSize};
        cursor: default;
        opacity: ${isDragEntering ? 0.7 : 1};
        outline: ${outline};
      `}
      suppressContentEditableWarning
    >
      <div
        css={css`
          display: inline-block;
          overflow-wrap: break-word;
          word-break: break-all;
          user-select: none;
        `}
      >
        {title}
      </div>
    </div>
  );
};

export default Topic;
