let headTag = null;
export default function importScript(src: string, id: string, opts: any = {}) {
  if (!headTag) {
    headTag = document.getElementsByTagName('head')[0];
  }
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    for (var k in opts) {
      script[k] = opts[k];
    }
    const timeout = setTimeout(reject, 7200); // 2 minutes
    script.type = 'text/javascript';
    script.id = id;
    script.async = true;
    script.src = src;
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = reject;
    headTag.appendChild(script);
  });
}
