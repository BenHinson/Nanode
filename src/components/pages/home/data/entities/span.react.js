import React, {useContext, useState, useEffect} from 'react';
import Entity from './entity.react';

export default function Span({spanId, spanName, spanContents, showTitles}) {

  return (
    <div rc-par={2} node-id={spanId} home-span={spanName}>
      <table className='tableTemplate' rc='Homepage_Span'>
        <TableHeader 
          spanId={spanId}
          spanName={spanName}
          showTitles={showTitles}
        />
        <tbody dir-nodes='true'>
          {Object.entries(spanContents).map(([nodeId, nodeData], i) => {
            return (
              <Entity
                nodeId={nodeId}
                nodeData={nodeData}
                parentId={spanId}
                key={i}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


const TableHeader = ({spanId, spanName, showTitles}) => {

  return (
    <thead>
      <tr rc-par={3} node-id={spanId}>
        <th><input span-name='true' defaultValue={spanName} /></th>
        <th></th>
        {showTitles ? (
          <>
            <th>Type</th>
            <th order='modified'>Modified<i></i></th>
            <th order='size'>Size<i></i></th>
          </>
        ) : (
          <>
            <th></th>
            <th></th>
            <th></th>
          </>
        )}
      </tr>
    </thead>
  )
}