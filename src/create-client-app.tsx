import * as React from 'react';
import * as ReactDom from 'react-dom';
// import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import ClientAppOptions from './interfaces/client-app-options.interface';
import ClientApplicationContext from './interfaces/client-application-context';
import { createStateManagement } from './helpers/create-state-management';
import ReactApplicationContext from './react-application-context';
import { createBrowserHistory } from 'history';
import emptyModule from './empty-module';
import importScript from './helpers/import-script';
import ReactHistoryContext from './react-history-context';

const defaultOptions = {
  enableReduxDevTools: false,
  enableSentry: false,
  renderMode: 'render',
};

export default async function createClientApp(_options: ClientAppOptions) {
  const options = { ...defaultOptions, ..._options };
  const modules =
    options.microFE === true ? await fetchExternalModules('/pwa-version') : {};

  const stateManagement = createStateManagement({
    enableReduxDevTools: options.enableReduxDevTools,
    storages: options.storages(),
    history: createBrowserHistory(),
    initialState: window.__STATE__ || {},
    getModules: (packageName: string, name: string) =>
      getModules(modules, packageName, name),
  });
  const applicationContext: ClientApplicationContext =
    stateManagement.applicationContext;
  const history = stateManagement.history;
  const store = stateManagement.store;
  const App = options.module.getComponent(applicationContext);
  const render = window.__SSR__ ? ReactDom.hydrate : ReactDom.render;

  render(
    <React.StrictMode>
      {/*<HelmetProvider>*/}
      <ReactApplicationContext.Provider value={applicationContext}>
        <ReactHistoryContext.Provider value={applicationContext.historyContext}>
          <Provider store={store}>
            <App />
          </Provider>
        </ReactHistoryContext.Provider>
      </ReactApplicationContext.Provider>
      {/*</HelmetProvider>*/}
    </React.StrictMode>,
    options.container,
  );
  window.store = store;
  window.sendoHistory = history;
}

async function fetchExternalModules(managementEndpoint: string) {
  if (!window.__MODULES__) {
    window.__MODULES__ = await fetch(managementEndpoint)
      .then(async (req) => {
        return (await req.json()).packages;
      })
      .catch(() => {
        return {};
      });
  }
  return window.__MODULES__;
}

export async function getModules(
  modules: any,
  packageName: string,
  name: string,
) {
  if (!modules[packageName]) {
    console.log(`[pwa] module "${packageName}:${name}" not found`);
    return emptyModule;
  }
  try {
    await Promise.all(
      modules[packageName].map((entry, id) =>
        importScript(entry, packageName + id),
      ),
    );
    const externalModule = window[packageName];
    const result = await externalModule.default(name);
    return result || emptyModule;
  } catch (error) {
    console.log(`[pwa] module "${packageName}:${name}" not found`);
    return emptyModule;
  }
}
