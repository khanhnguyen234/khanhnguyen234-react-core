import { createContext } from 'react';
import ApplicationContext from './interfaces/application-context';

const ReactApplicationContext = createContext<ApplicationContext>(undefined);

export default ReactApplicationContext;
