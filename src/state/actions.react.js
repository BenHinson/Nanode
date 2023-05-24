const setPageState = (pageState) => {
  return (dispatch) => {
    dispatch({
      type: 'setPageState',
      payload: pageState
    })
  }
}

const setNotificationModalState = (modalState) => {
  return (dispatch) => {
    dispatch({
      type: 'setModal',
      payload: modalState
    })
  }
}

export default {setNotificationModalState, setPageState}