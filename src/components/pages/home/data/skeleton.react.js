import React, {useState} from 'react';

export default function Skeleton({nodeId, onHomepage}) {

  return onHomepage ? (
    <div className='skeleton'>
      <SkeltonBaseFolders />
      <SkeltonRecents />
      <SkeletonTable />
    </div>
  ) : (
    <div>
      <SkeletonTable />
    </div>
  )
}

const SkeltonBaseFolders = () => {
  return (
    <div className='skeleton-basefolders flex-even-cent'>
      {Array(5).map((i) => {
        <div className="skeleton-load" key={i}>
          <p className="skeleton-img"></p>
        </div>
      })}
    </div>
  )
}

const SkeltonRecents = () => {
  return (
    <div className='skeleton-recents flex-even-cent'>
      {Array(5).map((i) => {
        <div className="skeleton-load" key={i}></div>
      })}
    </div>
  )
}

const SkeletonTable = () => {
  return (
    <div className='skeleton'>
    <div>
      <table className='skeleton-table'>
        <thead>
          <tr>
            <th> <p className='skeleton-text' style={{width: "200%"}}></p> </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[60,40,65,80,45,62,50].map((i) => (
            <tr className='skeleton-load' key={i}>
              <td> <p className='skeleton-img'></p> </td> 
              <td> <p className='skeleton-text' style={{width: i+"%"}}></p> </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  )
}