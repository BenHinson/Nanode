import React, {useState} from 'react';

export default function Panel() {

  return (
    <div className='PageInformation'>
      <span className="PIHeader flex-between-cent">
        <button className="NO_Upload flex-even-cent"><i className="fas fa-cloud-upload-alt"></i>Upload</button>
        <button className="NO_Folder flex-even-cent"><i className="fas fa-folder-plus"></i>Folder</button>
      </span>
    </div>
  )
}