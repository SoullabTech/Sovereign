export * from '../contract';
export function sameSubject(_thread: any, _anchor: any): boolean {
  return true;
}
export function repointThread(thread: any, anchor: any): any {
  return { ...thread, anchor };
}
