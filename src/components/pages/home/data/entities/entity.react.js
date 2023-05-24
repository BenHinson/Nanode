import React, {useContext, useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from '../../../../../state/actions.react';

import { Node } from '../../../../../JS/core';
import { ItemsPath, FileIcon, CapFirstLetter, DateFormatter, ConvertSize } from '../../../../../JS/tools';

export default function Entity({nodeId, nodeData, parentId}) {
  const node = (new Node(nodeData, nodeId, parentId)).data;
  const parent = 'home';

  const dispatch = useDispatch();
  const {setPageState} = bindActionCreators(StateActions, dispatch);

  const changeDirectory = () => {
    // nodeData.type.file
    //   ? () => {}
    //   : setPageState({nodeId})
    setPageState({nodeId})
  }

  return (
    <tr
      onClick={() => changeDirectory()}
      directory={ItemsPath(parent, node.name)}
      type={node.type.general}
      node-id={nodeId}
      rc={node.mime == "FOLDER" ? "Node_Folder" : "Node_File"}
      rcosp="TD"
      title={ItemsPath(parent, node.name)}
      style={node.color ? {boxShadow: `inset ${node.color} 3px`} : undefined}
      color={node.color || undefined}
      className="ui-draggable ui-draggable-handle ui-droppable"
      >
      <td><img loading="lazy" height="32" width="32" src={FileIcon(node, 90, 120, 'main')} /></td>
      <td>{CapFirstLetter(node.name)}</td>
      <td>{node.type.short}</td>
      <td>{DateFormatter(node.time.modified || node.time.created)}</td>
      <td>{node.size > 1 ? ConvertSize(node.size) : "-"}</td>
    </tr>
  )
}