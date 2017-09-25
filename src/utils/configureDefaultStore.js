import configureStore from "../configureStore";
import createDefaultReducer from "./reducers";

const configureDefaultStore = (initialState = {}, history) =>
  configureStore(createDefaultReducer, initialState, history);

export default configureDefaultStore;
