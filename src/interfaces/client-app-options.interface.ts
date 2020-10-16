import { AppOptions } from './app-options.interface';

export default interface ClientAppOptions extends AppOptions {
  container: HTMLElement;
  renderMode: 'hydrate' | 'render';
  enableReduxDevTools: boolean;
}
