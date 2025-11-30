import { redis } from "../config/redis";

export async function getCachedPattern(
  userId: string,
  element: string,
  computeFn: () => Promise<any>,
) {
  const key = `pattern:${userId}:${element}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn(`Cache miss for key: ${key}`, error);
  }

  const result = await computeFn();

  try {
    await redis.set(key, JSON.stringify(result), "EX", 3600);
  } catch (error) {
    console.warn(`Failed to cache result for key: ${key}`, error);
  }

  return result;
}

export async function processElementsInParallel(
  userId: string,
  query: string,
  elements: string[],
) {
  const { AgentRegistry } = await import("../core/factories/AgentRegistry");
  const registry = new AgentRegistry();

  const promises = elements.map(async (element) => {
    return getCachedPattern(userId, element, async () => {
      const agent = registry.createAgent(element);
      return await agent.processQuery(query);
    });
  });

  return await Promise.all(promises);
}
