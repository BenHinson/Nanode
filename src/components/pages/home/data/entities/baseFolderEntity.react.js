import React, {useContext, useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from '../../../../../state/actions.react';

import { Node } from '../../../../../JS/core';
import { CapFirstLetter, FileIcon, ItemsPath } from '../../../../../JS/tools';

export default function BaseFolderEntity({nodeId, nodeData, parentId}) {
  const node = (new Node(nodeData, nodeId, parentId)).data;
  const dispatch = useDispatch();
  const {setPageState} = bindActionCreators(StateActions, dispatch);

  const changeDirectory = () => {
    // nodeData.type.file
    //   ? () => {}
    //   : setPageState({nodeId})
    setPageState({nodeId})
  }

  return (
    <div
      directory={ItemsPath('Main', node.name)}
      type={node.type.general}
      node-id={node.id}
      onClick={() => changeDirectory()}
    >
      <img loading='lazy' height='60' width='60' src={FileIcon(node, 90, 120, 'main')}></img>
      <p title={ItemsPath('Main', node.name)}>{CapFirstLetter(node.name)}</p>
      <div></div>
    </div>
  )
}