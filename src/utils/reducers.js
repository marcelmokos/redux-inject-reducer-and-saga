/**
 * Combine all reducers in this file and export the combined reducers.
 */

import {fromJS} from "immutable";
import {combineReducers} from "redux-immutable";

function configReducer(state = fromJS({}), {type}) {
  switch (type) {
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  return combineReducers({
    config: configReducer,
    other: configReducer,
    ...injectedReducers,
  });
}
