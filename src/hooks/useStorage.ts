import { useContext } from 'react';
import ApplicationContext from '../react-application-context';

export default function useStorage(name: string) {
  const ctx = useContext(ApplicationContext);
  return ctx.getStorage(name);
}
