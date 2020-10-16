import { Request } from 'express';
import PWAModule from '../pwa-module';
import Storage from './storage.interface';

export interface AppOptions {
  appName: string;
  microFE?: boolean;
  module: PWAModule<any>;
  storages: (
    req?: Request,
  ) => {
    [x: string]: Storage;
  };
  enableSentry: boolean;
  enableLogger?: boolean;
}
