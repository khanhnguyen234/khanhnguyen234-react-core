import pathToRegexp from 'path-to-regexp';

const cache: {
  [x: string]: {
    [x: string]: {
      regexp: RegExp;
      keys: pathToRegexp.Key[];
    };
  };
} = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(
  path: string,
  options: pathToRegexp.ParseOptions & pathToRegexp.RegExpOptions,
) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys: pathToRegexp.Key[] = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}

export function matchPath(
  pathname: string,
  path: string,
  options: pathToRegexp.ParseOptions & pathToRegexp.RegExpOptions = {},
) {
  const { end = false, strict = false, sensitive = false } = options;

  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end,
      strict,
      sensitive,
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (end && !isExact) return null;

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {} as { [x: string]: any }),
    };
  }, null);
}
