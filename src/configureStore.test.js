import React from "react";
import {render} from "enzyme";
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import {put, takeLatest} from "redux-saga/effects";
import {configureStore, injectReducer, injectSaga} from "./";

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
    state => ({name: state[`${prefix}/testReducer`]}),
    dispatch => bindActionCreators({nameSend: nameSendAction}, dispatch),
  );

  // eslint-disable-next-line no-shadow
  return compose(withReducer, withSaga, withConnect)(({nameSend}) => {
    nameSend(`Name ${prefix}`);

    return null;
  });
};

const getWrappedThunkComponent = prefix => {
  // constants
  const NAME_SET = `${prefix}/NAME_SET`;

  const nameSet = name => ({
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
  const nameSendThunk = name => dispatch => dispatch(nameSet(name));

  const withReducer = injectReducer({key: `${prefix}/testReducer`, reducer});
  const withConnect = connect(
    state => ({name: state[`${prefix}/testReducer`]}),
    dispatch => bindActionCreators({sendName: nameSendThunk}, dispatch),
  );

  // eslint-disable-next-line no-shadow
  return compose(withReducer, withConnect)(({sendName}) => {
    sendName(`Name ${prefix}`);

    return null;
  });
};

function staticReducer(state = null) {
  return state;
}

describe("configureStore", () => {
  let store;

  beforeAll(() => {
    store = configureStore({config: staticReducer}, {config: true});
  });

  it("default store", () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it("component A, with reducer and saga", () => {
    const WrappedComponent = getWrappedSagaComponent("A");

    expect(store.getState()).toMatchSnapshot();
    const component = render(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });

  it("component B, with reducer and saga", () => {
    const WrappedComponent = getWrappedSagaComponent("B");

    expect(store.getState()).toMatchSnapshot();
    const component = render(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });

  it("component C, with reducer and using thunk", () => {
    const WrappedComponent = getWrappedThunkComponent("C");

    expect(store.getState()).toMatchSnapshot();
    const component = render(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });
});
