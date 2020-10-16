import { useContext } from 'react';
import ReactHistoryContext from '../react-history-context';

export default function useHistory() {
  const ctx = useContext(ReactHistoryContext);
  return ctx;
}
