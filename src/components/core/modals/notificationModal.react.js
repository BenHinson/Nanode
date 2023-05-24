import React, {useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import StateActions from '../../../state/actions.react';

const icons = {
  'info': 'fas fa-info-circle',
  'success': 'fas fa-check-circle',
  'error': 'fas fa-times-circle',
  'warning': 'fas fa-exclamation-circle'
}

export default function NotificationModal() {
  const modalState = useSelector((state) => state.notificationModal);
  const dispatch = useDispatch();
  const {setNotificationModalState} = bindActionCreators(StateActions, dispatch);

  useEffect(() => {
    const hideModal = setTimeout(() => {
      setNotificationModalState({isVisible: false})
    }, modalState.displayTime)

    return () => clearTimeout(hideModal)
  }, [modalState.isVisible === true])

  return (
    <div className={(modalState.isVisible ? 'display ' : '') + 'info-popup ' + (modalState.type ? 'info-popup info-popup-'+modalState.type : '')}>
      <span>
        <i className={icons[modalState.type]}></i>
        {modalState.text}
      </span>
      <i className='fas fa-times' onClick={() => setNotificationModalState({isVisible: false})}></i>
    </div>
  )
}