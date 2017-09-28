/**
 * Create the store with dynamic reducers
 */

import {combineReducers} from "redux-immutable";
import {createStore, applyMiddleware, compose} from "redux";
import {fromJS} from "immutable";
import {routerMiddleware} from "react-router-redux";
import {createMemoryHistory} from "history";
import thunkMiddleware from "redux-thunk";
import createSagaMiddleware from "redux-saga";
import routeReducer from "./utils/routeReducer";

const sagaMiddleware = createSagaMiddleware();

/**
 * Creates the main reducer with the dynamically injected ones
 */
export function createReducer(injectedReducers) {
  return combineReducers({
    route: routeReducer,
    ...injectedReducers,
  });
}

export default function configureStore(
  reducers = {},
  initialState = {},
  history = createMemoryHistory(),
) {
  // Create the store with 3 middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. thunkMiddleware: Makes redux-thunk work
  // 3. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    sagaMiddleware,
    thunkMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [applyMiddleware(...middlewares)];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
          // Prevent recomputing reducers for `replaceReducer`
          shouldHotReload: false,
        })
      : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(reducers),
    fromJS(initialState),
    composeEnhancers(...enhancers),
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = reducers; // Reducer registry
  store.injectedSagas = {}; // Saga registry
  store.history = history; // history

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept("./configureStore.js", () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}
