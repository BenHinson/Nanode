import React, {useContext, useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from '../../../state/actions.react';

import BlockOut from './blockOut.react';

const CtaColour = {
  '': '',
  'warning': 'CtaRed',
}

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


const primaryContentExample = (
  <p>Some example text goes here</p>
)


export default function Modal() {
  const modalState = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const {setNotificationModalState} = bindActionCreators(StateActions, dispatch);

  const {type, action, title, reject, accept, ctaType, primaryContent, secondaryContent, acceptCallback} = modalData;

  const show = false;

  return (
    <BlockOut show={show}>
      <div className='modalContainer'>
        <div className='modalMain'>
          <h3>{title}</h3>
          <divide />
          {primaryContentExample}
          <span>
            <button className='modalReject'>{reject}</button>
            <button
              className={'modalAccept ' + CtaColour[ctaType] || ''}
              onClick={acceptCallback}
            >{accept}</button>
          </span>
        </div>

        {secondaryContent}

      </div>
    </BlockOut>
  )
}