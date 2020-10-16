export default interface Storage {
  get(key: string, options?: any): any;
  set(key: string, value: any, options?: any): void;
  remove(key: string): void;
}
