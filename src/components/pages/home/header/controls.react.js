import React from 'react';

export default function Controls() {
  return (
    <div className='PageControls'>
      <span className="navigateBackward" title="Back"><i className="fas fa-chevron-left"></i></span>
      <span className="navigateForward" title="Forward"><i className="fas fa-chevron-right"></i></span>
    </div>
  )
}