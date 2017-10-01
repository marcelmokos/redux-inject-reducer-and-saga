# 💉 redux-inject-reducer-and-saga

[![npm version](https://img.shields.io/npm/v/redux-inject-reducer-and-saga.svg?style=flat)](https://www.npmjs.com/package/redux-inject-reducer-and-saga) 
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier) 
[![Build Status](https://travis-ci.org/marcelmokos/redux-inject-reducer-and-saga.svg?branch=master)](https://travis-ci.org/marcelmokos/redux-inject-reducer-and-saga) 
[![Coverage Status](https://coveralls.io/repos/github/marcelmokos/redux-inject-reducer-and-saga/badge.svg?branch=master)](https://coveralls.io/github/marcelmokos/redux-inject-reducer-and-saga?branch=master)
[![dependency](https://david-dm.org/marcelmokos/redux-inject-reducer-and-saga/status.svg)](https://david-dm.org/marcelmokos/redux-inject-reducer-and-saga) 
[![devDep](https://david-dm.org/marcelmokos/redux-inject-reducer-and-saga/dev-status.svg)](https://david-dm.org/marcelmokos/redux-inject-reducer-and-saga?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/marcelmokos/redux-inject-reducer-and-saga/badge.svg)](https://snyk.io/test/github/marcelmokos/redux-inject-reducer-and-saga) 

Code highly influenced by [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate) with some modifications
If you need more informations read [react-boilerplate docs](https://github.com/react-boilerplate/react-boilerplate/tree/master/docs) they are great.


The library allows us to add reducers and sagas after the store was initialized.
Since library wants to be universal and not decide what will be used it allows to use [redux-thunk](https://www.npmjs.com/package/redux-thunk) and [redux-saga](https://www.npmjs.com/package/redux-saga) simultaneously. With preference to use redux-saga.
The library is set to use [immutable](https://www.npmjs.com/package/immutable) but developers can use simple object and arrays as state in reducers.
[react-router v4](https://www.npmjs.com/package/react-router) is set and route reducer is included as default reducer.

# Install:

```bash
yarn add redux-inject-reducer-and-saga
```
```bash
npm install --save-dev redux-inject-reducer-and-saga
```

# Usage:
### configureStore

#### Without parameters
- only default route reducer will be initialized
```js
import {configureStore} from "redux-inject-reducer-and-saga";

const store = configureStore();
expect(store.getState()).toMatchSnapshot();
/*
Immutable.Map {
  "route": Immutable.Map {
    "location": null,
  },
}
*/
```

#### With reducers parameter
- reducers will be initialized with reducer's initialState
```js
import {configureStore} from "redux-inject-reducer-and-saga";

function staticReducer(state = null) {
 return state;
}

const reducers = {config: staticReducer};
const store = configureStore(reducers);
expect(store.getState()).toMatchSnapshot();
/*
Immutable.Map {
  "route": Immutable.Map {
    "location": null,
  },
  "config": null, // 💉
}
*/
```
#### With reducers and initialState parameter
- reducers will be initialized with initialState argument
```js
import {configureStore} from "redux-inject-reducer-and-saga";

function staticReducer(state = null) {
 return state;
}

const reducers = {config: staticReducer};
const initialState = {config: true};
const store = configureStore(reducers, initialState);
expect(store.getState()).toMatchSnapshot();
/*
Immutable.Map {
  "route": Immutable.Map {
    "location": null,
  },
  "config": true, // 💉
}
 */
```

## Inject Reducer and Saga
```js
import React from "react";
import {mount} from "enzyme";
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import {put, takeLatest} from "redux-saga/effects";
import {configureStore, injectReducer, injectSaga} from "redux-inject-reducer-and-saga";

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


const store = configureStore();

it("component A, with reducer and saga", () => {
  const WrappedComponent = getWrappedSagaComponent("A");

  const component = mount(<WrappedComponent />, {context: {store}});
  expect(store.getState()).toMatchSnapshot();
  /*
  
  Immutable.Map {
    "route": Immutable.Map {
      "location": null,
    },
    "A/testReducer": "Name A", // 💉
  }
  
   */
});

it("component B, with reducer and saga", () => {
  const WrappedComponent = getWrappedSagaComponent("B");

  // store used from previous example
  const component = mount(<WrappedComponent />, {context: {store}});
  expect(store.getState()).toMatchSnapshot();
  /*
  
  Immutable.Map {
    "route": Immutable.Map {
      "location": null,
    },
    "A/testReducer": "Name A",
    "B/testReducer": "Name B", // 💉
  }
  
   */
});
```

## Inject Reducer and use thunk
```js
import React from "react";
import {mount} from "enzyme";
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import {configureStore, injectReducer, injectSaga} from "redux-inject-reducer-and-saga";

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

it("component C, with reducer and saga", () => {
  const WrappedComponent = getWrappedThunkComponent("C");

  // store used from previous examples
  const component = mount(<WrappedComponent />, {context: {store}});
  expect(store.getState()).toMatchSnapshot();
  /*
  
  Immutable.Map {
    "route": Immutable.Map {
      "location": null,
    },
    "A/testReducer": "Name A",
    "B/testReducer": "Name B",
    "C/testReducer": "Name C", // 💉
  }
  
   */
});
```

More complex test: https://github.com/marcelmokos/redux-inject-reducer-and-saga/blob/master/src/configureStore.test.js
