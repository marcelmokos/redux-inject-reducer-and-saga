// @flow
import React from "react";
import {mount} from "enzyme";
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import {put, takeLatest} from "redux-saga/effects";
import {configureStore, injectReducer, injectSaga} from "./";

const {describe, beforeAll, it, expect} = global;

const getWrappedSagaComponent = prefix => {
  // constants
  const NAME_SEND = `${prefix}/NAME_SEND`;
  const NAME_SET = `${prefix}/NAME_SET`;

  // actions
  const nameSendAction = name => ({
    type: NAME_SEND,
    payload: name,
  });

  const nameSetAction = name => ({
    type: NAME_SET,
    payload: name,
  });

  // reducers
  const reducer = (state = "no-name", {type, payload}) => {
    switch (type) {
      case NAME_SET:
        return payload;
      default:
        return state;
    }
  };

  // sagas
  function* nameSetSaga(action) {
    const name = action.payload;

    yield put(nameSetAction(name));
  }

  function* saga() {
    yield takeLatest(NAME_SEND, nameSetSaga);
  }

  const withReducer = injectReducer({key: `${prefix}/testReducer`, reducer});
  const withSaga = injectSaga({key: `${prefix}/testSaga`, saga});
  const withConnect = connect(
    state => ({name: state.get(`${prefix}/testReducer`)}), // mapStateToProps
    dispatch => bindActionCreators({nameSend: nameSendAction}, dispatch), // mapDispatchToProps
  );

  type Props = {
    name: string,
    nameSend: string => void,
  };

  class Component extends React.Component<Props, any> {
    componentDidMount() {
      this.props.nameSend(`Name ${prefix}`);
    }

    render() {
      return <span>{this.props.name}</span>;
    }
  }

  // prettier-ignore
  return compose(
    withReducer,
    withSaga,
    withConnect,
  )(Component);
};

const getWrappedThunkComponent = prefix => {
  // constants
  const NAME_SET = `${prefix}/NAME_SET`;

  const nameSetAction = name => ({
    type: NAME_SET,
    payload: name,
  });

  // reducers
  const reducer = (state = "no-name", {type, payload}) => {
    switch (type) {
      case NAME_SET:
        return payload;
      default:
        return state;
    }
  };

  // thunks
  const nameSendThunk = name => dispatch => dispatch(nameSetAction(name));

  const withReducer = injectReducer({key: `${prefix}/testReducer`, reducer});
  const withConnect = connect(
    state => ({name: state.get(`${prefix}/testReducer`)}), // mapStateToProps
    dispatch => bindActionCreators({nameSend: nameSendThunk}, dispatch), // mapDispatchToProps
  );

  type Props = {
    name: string,
    nameSend: string => void,
  };

  class Component extends React.Component<Props, any> {
    componentDidMount() {
      this.props.nameSend(`Name ${prefix}`);
    }

    render() {
      return <span>{this.props.name}</span>;
    }
  }

  // prettier-ignore
  return compose(
    withReducer,
    withConnect,
  )(Component);
};

describe("configureStore", () => {
  it("default store, without parameters", () => {
    const store = configureStore();
    expect(store.getState()).toMatchSnapshot();
  });

  it("store with reducers parameter", () => {
    function staticReducer(state = null) {
      return state;
    }

    const reducers = {config: staticReducer};
    const store = configureStore(reducers);
    expect(store.getState()).toMatchSnapshot();
  });

  it("store with reducers and initialState parameter", () => {
    function staticReducer(state = null) {
      return state;
    }

    const reducers = {config: staticReducer};
    const initialState = {config: true};
    const store = configureStore(reducers, initialState);
    expect(store.getState()).toMatchSnapshot();
  });
});

describe("configureStore and inject reducers, sagas and thunks", () => {
  let store;

  beforeAll(() => {
    store = configureStore();
  });

  it("default store", () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it("component A, with reducer and saga", () => {
    const WrappedComponent = getWrappedSagaComponent("A");

    expect(store.getState()).toMatchSnapshot();
    const component = mount(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });

  it("component B, with reducer and saga", () => {
    const WrappedComponent = getWrappedSagaComponent("B");

    expect(store.getState()).toMatchSnapshot();
    const component = mount(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });

  it("component C, with reducer and using thunk", () => {
    const WrappedComponent = getWrappedThunkComponent("C");

    expect(store.getState()).toMatchSnapshot();
    const component = mount(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });
});
