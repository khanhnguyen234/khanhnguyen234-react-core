import { createContext } from 'react';
import { History, LocationDescriptorObject } from 'history';

interface QueryOptions {
  merge?: boolean;
}

export interface HistoryContext {
  history: History;
  back: () => void;
  push: (path: string | LocationDescriptorObject, state?: any) => void;
  replace: (path: string | LocationDescriptorObject, state?: any) => void;
  replaceQuery: (query: any, options?: QueryOptions) => void;
  pushQuery: (query: any, options?: QueryOptions) => void;
}

const ReactHistoryContext = createContext<HistoryContext>(undefined);

export default ReactHistoryContext;
