import React from "react";
import {render} from "enzyme";
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import {put, takeLatest} from "redux-saga/effects";
import {configureStore, injectReducer, injectSaga} from "./";
import createDefaultReducer from "./utils/reducers";

const getWrappedComponent = postfix => {
  // constants
  const NAME_SEND = `NAME_SEND_${postfix}`;
  const NAME_SET = `NAME_SET_${postfix}`;

  // actions
  const nameSend = name => ({
    type: NAME_SEND,
    payload: name,
  });

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

  // sagas
  function* setName(action) {
    const name = action.payload;

    yield put(nameSet(name));
  }

  function* saga() {
    yield takeLatest(NAME_SEND, setName);
  }

  const withReducer = injectReducer({key: `testReducer${postfix}`, reducer});
  const withSaga = injectSaga({key: `testSaga${postfix}`, saga});
  const withConnect = connect(
    state => ({name: state.testReducer}),
    dispatch => bindActionCreators({nameSend}, dispatch),
  );

  // eslint-disable-next-line no-shadow
  return compose(withReducer, withSaga, withConnect)(({nameSend}) => {
    nameSend(`Name ${postfix}`);

    return null;
  });
};

describe("configureStore", () => {
  let store;

  beforeAll(() => {
    store = configureStore(createDefaultReducer, {config: "configState"});
  });

  it("default store", () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it("component A, with reducer and saga", () => {
    const WrappedComponent = getWrappedComponent("A");

    expect(store.getState()).toMatchSnapshot();
    const component = render(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });

  it("component B, with reducer and saga", () => {
    const WrappedComponent = getWrappedComponent("B");

    expect(store.getState()).toMatchSnapshot();
    const component = render(<WrappedComponent />, {context: {store}});
    expect(component).toMatchSnapshot();
    expect(store.getState()).toMatchSnapshot();
  });
});
