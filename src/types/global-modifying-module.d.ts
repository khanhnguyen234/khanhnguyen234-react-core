import { Store } from 'redux';
import { History } from 'history';

declare interface process {
  env: {
    NODE_ENV: string;
  };
}

declare global {
  const __DEBUG__: boolean;
  const __SERVER__: boolean;
  const __CLIENT__: boolean;
  const __COMMIT_HASH__: string;

  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    store: Store;
    historyActions: any;
    __STATE__: any;
    __MODULES__: any;
    __SSR__: boolean;
    sendoHistory: History;
  }
}

export {};
