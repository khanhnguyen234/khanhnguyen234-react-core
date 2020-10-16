import { Reducer } from 'redux';
interface Handler {
  type: string | string[];
  handler: Reducer;
}
export default interface DataSource {
  name: string;
  initState: any;
  handlers: { handler: Handler; [key: string]: any }[];
}
