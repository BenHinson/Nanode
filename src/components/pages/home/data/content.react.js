import React, {useContext, useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useQuery } from 'react-query';

import StateActions from '../../../../state/actions.react'

import BaseFolders from './baseFolders.react';
import Recents from './recents.react';
import NewSpan from './entities/newSpan.react';
import Skeleton from './skeleton.react';
import Span from './entities/span.react';

import { Core, Node } from '../../../../JS/core';
import { fetchDirectory } from '../../../../JS/fetch';
import { ItemsPath, FileIcon, CapFirstLetter, DateFormatter, ConvertSize } from '../../../../JS/tools';

export default function Content() {
  const {nodeId, nodeName, nodeSelected} = useSelector((state) => state.pageState);
  const dispatch = useDispatch();
  const {setPageState} = bindActionCreators(StateActions, dispatch);

  const [onHomepage, setOnHomepage] = useState(nodeId === 'home' || nodeId === 'homepage');
  useEffect(() => setOnHomepage(nodeId === 'home' || nodeId === 'homepage'), [nodeId])
 
  const { isLoading, error, data } = useQuery(['directory', nodeId], () => fetchDirectory({folder: nodeId}), { refetchOnWindowFocus: false })

  useEffect(() => {
    document.title = ((nodeName !== 'homepage' && nodeName !== 'home') ? nodeName : 'My Drive');
  }, [nodeName])

  return (
    <div className='Content fileContainer' rc='File_Container'>
      {
        isLoading ? (
          <Skeleton onHomepage={onHomepage} />
        ) : 
        onHomepage ? (
          <div rc-osp='2'>
            <Directory data={data} onHomepage={onHomepage}/>
          </div>
        ) : (
          <Directory data={data} onHomepage={onHomepage}/>
        )
      }
    </div>
  )
}

const Directory = ({data, onHomepage}) => {
  return (
    <>
      {Object.entries(data.Contents).map(([spanId, spanData], i) => {
        return (
          spanId === '_MAIN_' ? (
            <>
              <BaseFolders
                spanId={spanId}
                spanContents={spanData}
                key={i}
              />
              <Recents key={'recents'+i} />
            </>
          ) : (
            <Span
              spanId={spanId}
              spanName={spanData.name}
              spanContents={spanData.contents}
              showTitles={i===0 || (onHomepage && i===1)}
              key={i}
            />
          )
        )
      })}

      {onHomepage && (
        <NewSpan />
      )}
    </>
  )
}