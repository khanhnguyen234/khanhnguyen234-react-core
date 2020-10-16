import React, {
  ElementType,
  ReactElement,
  createElement,
  useEffect,
  useState,
  memo,
  PureComponent,
} from 'react';
import { History } from 'history';
import PWAModuleOptions, {
  FnModuleFactory,
  RoutingEntry,
} from './interfaces/pwa-module-options.interface';

import ClientApplicationContext from './interfaces/client-application-context';

import { matchPath } from './helpers/matchPath';
import ReactRouteContext from './react-route-context';
import { parseQuery } from './helpers/qs';

function matchRoutes(
  pathname: string,
  routings: RoutingEntry[],
): {
  component?: React.ElementType;
  match: any | null;
} {
  let match: {} = null;
  let component: React.ElementType;
  routings.forEach((child) => {
    if (match === null) {
      match = matchPath(pathname, child.path);
      if (match !== null) {
        component = child.module;
      }
    }
  });
  return {
    match,
    component,
  };
}

type ModuleStatus = 'initial' | 'initializing' | 'initialized';

const computeRoutingChildren = (routing: RoutingEntry[], history: History) => {
  const matchResult = matchRoutes(history.location.pathname, routing);
  let Component: React.ElementType = 'div';
  let params = {};
  if (matchResult.match !== null) {
    Component = matchResult.component;
    params = matchResult.match.params;
  }

  return {
    Component,
    match: {
      params,
      pathname: history.location.pathname,
      search: history.location.search,
      state: history.location.state,
      hash: history.location.hash,
      getQuery: () => parseQuery(history.location.search),
    },
  };
};

interface RouterProps {
  routing: RoutingEntry[];
  history: History;
  childrenProps: any;
}

function Router({ routing, history, childrenProps }: RouterProps) {
  const [matchedResult, setMatchedResult] = useState(() => {
    return computeRoutingChildren(routing, history);
  });
  const hasRouteChildren = routing.length > 0;
  useEffect(() => {
    if (hasRouteChildren) {
      return history.listen(() => {
        setMatchedResult(computeRoutingChildren(routing, history));
      });
    }
  }, []);

  return (
    <ReactRouteContext.Provider value={matchedResult.match}>
      <matchedResult.Component {...childrenProps} />
    </ReactRouteContext.Provider>
  );
}

export default class PWAModule<P extends Object> {
  public name: string;

  private factory: FnModuleFactory;

  private renderer: ElementType;
  private status: ModuleStatus;
  private routing: RoutingEntry[];
  private subModules: ReactElement[];
  private namedModules: { [x: string]: ElementType };
  private factoryCallbacks: (() => void)[];

  constructor(options: PWAModuleOptions) {
    this.renderer = options.placeholder;
    this.factory = options.factory;
    this.name = options.name;
    this.status = 'initial';
    this.subModules = [];
    this.routing = [];
    this.namedModules = {};
    this.factoryCallbacks = [];
  }

  factoryModule = async (
    ctx: ClientApplicationContext,
    callback: () => void,
  ) => {
    if (this.status === 'initializing' || this.status === 'initial') {
      this.factoryCallbacks.push(callback);
    }

    if (this.status === 'initial') {
      this.status = 'initializing';
      const config = await this.factory(ctx);
      this.status = 'initialized';
      this.renderer = config.layout || 'div';
      this.namedModules = config.named;
      this.subModules = config.subs.map((s, k) =>
        createElement(s, { key: `${(s as any).displayName}-${k}` }),
      );
      this.routing = config.routing;

      if (config.data) {
        ctx.registerReducers(config.data);
      }

      const callbacks = [].concat(this.factoryCallbacks);
      this.factoryCallbacks = [];
      callbacks.forEach((callback) => callback());
    }
  };

  getComponent = (ctx: ClientApplicationContext): ElementType => {
    const self = this;

    class Module extends PureComponent<
      P,
      { count: number; error: boolean; info: any }
    > {
      static displayName = self.name;

      unmounted = false;

      constructor(props, context) {
        super(props, context);
        this.state = {
          count: 0,
          error: false,
          info: null,
        };
      }

      update = () => {
        console.log(`[pwa] ${self.name} - ${self.status}`);
        if (self.status === 'initialized') return;
        self.factoryModule(ctx, () => {
          if (!this.unmounted) {
            this.setState({
              count: this.state.count + 1,
            });
          }
        });
      };

      componentDidMount() {
        this.update();
      }
      componentDidUpdate() {
        this.update();
      }

      componentWillUnmount() {
        this.unmounted = true;
      }

      componentDidCatch(error, info) {
        console.error(error);
        console.error(info);
        this.setState({
          error: true,
          info,
        });
      }

      render() {
        const Renderer = self.renderer;
        if (this.state.error) {
          return <pre>{JSON.stringify(this.state.info, null, 2)}</pre>;
        }
        return (
          <Renderer
            {...this.props}
            {...self.namedModules}
            Router={(childrenProps) => (
              <Router
                childrenProps={childrenProps}
                history={ctx.history}
                routing={self.routing}
              />
            )}
            subs={self.subModules}
          />
        );
      }
    }
    return Module;
  };
}

export { PWAModule };
