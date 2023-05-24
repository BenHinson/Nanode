import React, {useContext, useState, useEffect} from 'react';

export default function BlockOut({show, children}) {
  // TODO: Off-click close.
  // TODO: Escape close.

  return (
    <div className={'blockOut' + (show ? ' grid-items-center' : '')}>
      {children}
    </div>
  )
}