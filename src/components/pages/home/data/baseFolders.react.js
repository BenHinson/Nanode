import React, {useContext, useState, useEffect} from 'react';
import { PageContext } from '../../../../state/context/PageContext.react';
import BaseFolderEntity from './entities/baseFolderEntity.react';

export default function BaseFolders({spanId, spanContents}) {

  return (
    <folders node-id={spanId} className='baseFolders flex-even-cent'>
      {Object.entries(spanContents.contents).map(([nodeId, nodeData], i) => {
        return (
          <BaseFolderEntity
            nodeId={nodeId}
            nodeData={nodeData}
            parentId={spanId}
            key={i}
          />
        )
      })}
    </folders>
  )
}