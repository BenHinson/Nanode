import React, {useEffect, useState} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from './state/actions.react';

import { Core } from './JS/core';

import Home from './components/pages/home.react';
import Bin from './components/pages/bin.react';

import SideBar from './components/core/sidebar/sidebar.react';
import NotificationModal from './components/core/modals/notificationModal.react';
import Modal from './components/core/modals/modal.react';
import ContextMenu from './components/core/contextMenu/contextMenu.react';

export default function App() {
  const dispatch = useDispatch();
  const {setNotificationModalState} = bindActionCreators(StateActions, dispatch);
  const [internetConnection] = useState(window?.navigator?.onLine || undefined);

  useEffect(() => {
    return setInternetNotification(setNotificationModalState, internetConnection);
  }, [internetConnection])


  return (
    <BrowserRouter>

      <SideBar />

      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='bin' element={<Bin />}/>
      </Routes>

      <ContextMenu />
      <NotificationModal />
      <Modal />
      <UploadButtons />

    </BrowserRouter>
  )
}


const setInternetNotification = (setNotificationModalState, internetConnection) => {
  console.log(internetConnection)
  return setNotificationModalState({
    isVisible: true,
    ...internetConnection ? {
      type: 'success',
      text: 'Internet Connection Restored',
      displayTime: 5000,
    } : {
      type: 'error',
      text: 'You are not connected to the internet',
      displayTime: 20000,
    }
  })
}



function UploadButtons() {
  return (
    <div className='UploadBtns'>
      <input id="fileUploadBtn" type="file" multiple></input>
      <input id="folderUploadBtn" type="file" multiple webkitdirectory="true" mozdirectory="true"></input>
      <input id="codexUploadBtn" type="file" accept="text/*" multiple></input>
      <div className='DragDropOverlay'>Drop your files to Upload</div>
    </div>
  )
}