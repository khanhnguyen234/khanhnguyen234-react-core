import { MicroModule } from './micro-module';

function Null() {
  return null;
}

const emptyModule = new MicroModule({
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
