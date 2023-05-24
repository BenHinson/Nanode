import React, {useContext, useState, useMemo, useEffect, useCallback} from 'react';
import { useQuery } from 'react-query';
import { PageContext } from '../../../../state/context/PageContext.react';

import { Node } from '../../../../JS/core';
import { FileIcon, CapFirstLetter } from '../../../../JS/tools';
import { fetchRecents } from '../../../../JS/fetch';


export default function Recents() {
  const [showRecents, toggleShowRecents] = useState(false);

  return (
    <recents className='recentFiles flex-even-cent'>
      <div className='recentContainer flex-even-cent'>
        {showRecents && <IterateRecentEntities />}
      </div>
      <button className='toggleRecent trans300' onClick={() => toggleShowRecents(!showRecents)}>
        {showRecents ? 'Hide Recent' : 'Show Recent'}
      </button>
    </recents>
  )
}

const IterateRecentEntities = () => {
  const { isLoading, error, data } = useQuery('recents', fetchRecents, { refetchOnWindowFocus: false })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error!</p>

  return (
    Object.entries(data.recent).map(([nodeId, nodeData], i) => {
      nodeData.mime = nodeData.type.mime;
      const node = (new Node(nodeData, nodeId, nodeData.parent)).data;

      return (
        <div parent-node={node.parent} type={node.type.general} node-id={nodeId} rc='Recent_Node' rc-osp='P,IMG' key={i}>
          <img loading='lazy' height='48' width='48' src={FileIcon(node, 48, 48, 'main')}></img>
          <p>{CapFirstLetter(node.name)}</p>
        </div>
      )
    })
  )
}