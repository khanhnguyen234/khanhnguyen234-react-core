import { FnRegisterReducers } from '../types/fn-register-reducers';
import { History } from 'history';
import { Storage } from '@khanhnguyen234/react-common/src/storages';
import { MicroModule } from '../micro-module';
import { HistoryContext } from '../react-history-context';

export default interface ApplicationContext {
  registerReducers: FnRegisterReducers;
  history: History;
  dispatch: Function;
  getStorage(name: string): Storage;
  getExternal(module: string, name: string): Promise<MicroModule<any>>;
  historyContext: HistoryContext;
}
