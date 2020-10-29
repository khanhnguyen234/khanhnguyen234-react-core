import ApplicationContext from './application-context';
import DataSource from './data-source.interface';

export interface RoutingEntry {
  path: string;
  module: React.ElementType;
}

export interface ModuleFactoryResult {
  layout: React.ElementType;
  subs: React.ElementType[];
  routing: RoutingEntry[];
  named: { [x: string]: React.ElementType };
  data?: DataSource[];
}

export type FnModuleFactory = (
  context: ApplicationContext,
) => Promise<ModuleFactoryResult>;

export default interface MicroModuleOptions {
  name: string;
  placeholder: React.ElementType;
  factory: FnModuleFactory;
}
