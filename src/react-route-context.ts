import { createContext } from 'react';

export interface RouteContext<Q = Object, P = Object> {
  // params: P;
  params: any;
  search: string;
  state: any;
  hash: string;
  pathname: string;
  getQuery: () => any;
}

const ReactRouteContext = createContext<RouteContext>(undefined);

export default ReactRouteContext;
