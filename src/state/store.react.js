import { createStore, applyMiddleware } from "redux";
import { reducers } from "./reducers.react";
import thunk from 'redux-thunk';

export const Store = createStore(
  reducers,
  {},
  applyMiddleware(thunk)
)