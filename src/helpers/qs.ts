import memoize from 'memoize-one';
import qs from 'qs';

export const parseQuery = memoize((query: string) => {
  return qs.parse(query, {
    ignoreQueryPrefix: true,
  });
});

export const stringifyQuery = memoize((query: any) => {
  return qs.stringify(query, {
    addQueryPrefix: true,
  });
});
