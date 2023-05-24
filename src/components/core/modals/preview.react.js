import React, {useContext, useState, useEffect} from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import StateActions from '../../../state/actions.react';

import BlockOut from './blockOut.react';


const modalData = {
  'type': '',
  'title': 'Example Title',
  'reject': 'Reject',
  'accept': 'Accept',
  'ctaType': '',
  'acceptCallback': () => {console.log('Called back')},
  'primaryContent': <></>,
  'secondaryContent': <></>,
}

export default function Preview() {
  // const modalState = useSelector((state) => state.modal);
  // const dispatch = useDispatch();
  // const {setNotificationModalState} = bindActionCreators(StateActions, dispatch);

  // const {type, action, title, reject, accept, ctaType, primaryContent, secondaryContent, acceptCallback} = modalData;

  const show = true;

  return (
    <BlockOut show={show}>
      <div className='Preview'>

      </div>
    </BlockOut>
  )
}