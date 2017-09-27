import configureStore from "../configureStore";

const configureDefaultStore = (initialState = {}, history) =>
  configureStore({}, initialState, history);

export default configureDefaultStore;
