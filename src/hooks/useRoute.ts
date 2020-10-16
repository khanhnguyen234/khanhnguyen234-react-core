import { useContext } from 'react';
import ReactRouteContext from '../react-route-context';

export default function useRoute() {
  const ctx = useContext(ReactRouteContext);
  return ctx;
}
