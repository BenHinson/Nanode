import { combineReducers } from 'redux';

// pageStateReducer
const pageStateProps = {
  nodeId: 'home',
  nodeName: 'home',
  nodesSelected: new Set(),
}
const pageStateReducer = (state=pageStateProps, action) => {
  switch (action.type) {
    case 'setPageState':
      return {...state, ...action.payload}
    default:
      return state;
  }
}

// notificationModalReducer
const notificationModalProps = {
  isVisible: false,
  type: '',
  text: '',
  displayDelay: 0,
  displayTime: 0,
}
const notificationModalReducer = (state=notificationModalProps, action) => { 
  switch (action.type) {
    case 'setModal':
      return state = action.payload;
    default:
      return state;
  }
}


// * Export Reducers
export const reducers = combineReducers({
  pageState: pageStateReducer,
  notificationModal: notificationModalReducer,
})