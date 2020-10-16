import { PWAModule } from './pwa-module';

function Null() {
  return null;
}

const emptyModule = new PWAModule({
  name: 'empty',
  placeholder: Null,
  factory: async (ctx) => {
    return {
      layout: Null,
      named: {},
      routing: [],
      subs: [],
    };
  },
});

export default emptyModule;
