import { History } from 'history';
import {
  Reducer,
  Store,
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  combineReducers,
} from 'redux';
import _get from 'lodash-es/get';
import thunk from 'redux-thunk';

import ApplicationContext from '../interfaces/application-context';
import DataSource from '../interfaces/data-source.interface';
import Storage from '../interfaces/storage.interface';
import { FnRegisterReducers } from '../types/fn-register-reducers';
import PWAModule from '../pwa-module';
import createHistoryContext from '../create-history-context';

interface ExternalModuleEntry {
  version: string;
  entry: string;
}
interface ExternalModulesMap {
  [x: string]: ExternalModuleEntry;
}

interface StateManagementOptions {
  enableReduxDevTools: boolean;
  history: History;
  storages: {
    [x: string]: Storage;
  };
  initialState: Object;
  getModules: (packageName: string, name: string) => Promise<PWAModule<any>>;
}

interface StoreOptions {
  history: History;
  reducers: Reducer;
  getApplicationContext: () => ApplicationContext;
  initialState: Object;
  enableReduxDevTools: boolean;
}

function createStore(storeOptions: StoreOptions): Store {
  const composeEnhancers =
    storeOptions.enableReduxDevTools &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
      : compose;
  const enhancer = composeEnhancers(
    applyMiddleware(
      thunk.withExtraArgument(storeOptions.getApplicationContext),
    ),
  );

  const initialState = storeOptions.initialState;

  return createReduxStore(storeOptions.reducers, initialState, enhancer);
}

interface StateManagement {
  applicationContext: ApplicationContext;
  store: Store;
  history: History;
}

const emptyReducer: Reducer = (state = 1, _) => state;

export function createStateManagement(
  options: StateManagementOptions,
): StateManagement {
  const history = options.history;
  const historyContext = createHistoryContext(history);

  const installedReducers = new Set<string>();
  const reducers: {
    [k: string]: Reducer;
  } = {
    _: emptyReducer,
  };
  const actions: {
    [reducer: string]: { [action: string]: Function };
  } = {};
  let applicationContext: ApplicationContext;
  const store: Store = createStore({
    history,
    getApplicationContext: () => applicationContext,
    reducers: combineReducers(reducers),
    initialState: options.initialState,
    enableReduxDevTools: options.enableReduxDevTools,
  });

  const registerReducers: FnRegisterReducers = (dataSources: DataSource[]) => {
    let needToReplaceReducer = false;
    let reducerActions = {};
    dataSources.forEach((dataSource) => {
      if (installedReducers.has(dataSource.name)) {
        return;
      }
      needToReplaceReducer = true;
      installedReducers.add(dataSource.name);
      const actionTypeToHandlerMap = dataSource.handlers.reduce<{
        [x: string]: Reducer;
      }>((map, { handler, actions }) => {
        if (actions) {
          Object.assign(reducerActions, actions);
          if (typeof handler.type === 'string') {
            map[handler.type] = handler.handler;
          } else {
            handler.type.forEach((type) => {
              map[type] = handler.handler;
            });
          }
        }
        return map;
      }, {});

      const initState = dataSource.initState;

      reducers[dataSource.name] = (state = initState, action) => {
        const handler = actionTypeToHandlerMap[action.type];
        if (!handler) return state;
        return handler(state, action);
      };
      actions[dataSource.name] = reducerActions;
    });
    if (needToReplaceReducer) {
      store.replaceReducer(combineReducers(reducers));
    }
  };

  function dispatch() {
    const keys = arguments[0];
    let res = [].concat(...arguments, applicationContext);
    res = res.splice(1);
    const action = _get(actions, keys);
    if (!action) return;
    return store.dispatch(action.apply(this, res));
  }

  function getStorage(name: string) {
    return options.storages[name];
  }

  applicationContext = {
    registerReducers: registerReducers,
    history,
    dispatch,
    getStorage,
    getExternal: options.getModules,
    historyContext,
  };

  return {
    applicationContext,
    store,
    history,
  };
}
