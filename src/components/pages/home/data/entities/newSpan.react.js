import React, {useContext, useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from '../../../../../state/actions.react';

export default function NewSpan() {
  const dispatch = useDispatch();
  const {setNotificationModalState} = bindActionCreators(StateActions, dispatch);

  const showModal = () => {
    setNotificationModalState({
      isVisible: true,
      type: 'info',
      text: 'This is a test',
      displayDelay: 1000,
      displayTime: 5000,
    })
  }

  return (
    <button className='newSpan' onClick={() => showModal()}>New Span</button>
  )
}