import { Request } from 'express';
import MicroModule from '../micro-module';
import Storage from './storage.interface';

export interface AppOptions {
  appName: string;
  microFE?: boolean;
  module: MicroModule<any>;
  storages: (
    req?: Request,
  ) => {
    [x: string]: Storage;
  };
  enableSentry: boolean;
  enableLogger?: boolean;
}
