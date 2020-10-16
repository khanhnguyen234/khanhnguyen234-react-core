import { History } from 'history';
import { HistoryContext } from './react-history-context';
import { parseQuery, stringifyQuery } from './helpers/qs';
export default function createHistoryContext(history: History): HistoryContext {
  return {
    history,
    back: history.goBack,
    push: history.push,
    replace: history.replace,
    pushQuery: (query, options = {}) => {
      const search: string = buildSearchFromQuery(query, options.merge);
      history.push({
        search,
      });
    },
    replaceQuery: (query, options = {}) => {
      const search: string = buildSearchFromQuery(query, options.merge);
      history.replace({
        search,
      });
    },
  };
  function buildSearchFromQuery(query: any, merge: boolean = false) {
    let search: string;
    const currentQuery = parseQuery(history.location.search);
    if (merge) {
      search = stringifyQuery({ ...currentQuery, ...query });
    } else {
      search = stringifyQuery(query);
    }
    return search;
  }
}
