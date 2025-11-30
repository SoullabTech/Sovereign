// super-simple IoC with typed tokens
type Registry = Map<string, unknown>;
const reg: Registry = new Map();

export const bind = <T>(key: string, value: T) => { reg.set(key, value); };
export const get  = <T>(key: string): T => {
  if (!reg.has(key)) throw new Error(`DI: missing binding for "${key}"`);
  return reg.get(key) as T;
};
export const has  = (key: string) => reg.has(key);
export const reset = () => reg.clear();