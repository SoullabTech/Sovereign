/**
 * Docker operations for MAIA CLI
 */

import { execSync } from 'child_process';

export interface ContainerInfo {
  name: string;
  status: string;
  ports: string;
  image: string;
}

export function isDockerRunning(): boolean {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getContainers(): ContainerInfo[] {
  try {
    const output = execSync(
      'docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}|{{.Image}}"',
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [name, status, ports, image] = line.split('|');
        return { name, status, ports, image };
      });
  } catch {
    return [];
  }
}

export function getContainerCount(): number {
  try {
    const output = execSync('docker ps -q | wc -l', { encoding: 'utf-8', stdio: 'pipe' });
    return parseInt(output.trim(), 10);
  } catch {
    return 0;
  }
}

export function getPortMappings(): Record<number, string> {
  const containers = getContainers();
  const portMap: Record<number, string> = {};

  for (const container of containers) {
    // Parse ports like "0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp"
    const portMatches = container.ports.matchAll(/0\.0\.0\.0:(\d+)->(\d+)/g);
    for (const match of portMatches) {
      const hostPort = parseInt(match[1], 10);
      portMap[hostPort] = container.name;
    }
  }

  return portMap;
}

export function containerExists(name: string): boolean {
  try {
    execSync(`docker ps -a --filter "name=^${name}$" --format "{{.Names}}"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return true;
  } catch {
    return false;
  }
}

export function isContainerRunning(name: string): boolean {
  try {
    const output = execSync(
      `docker ps --filter "name=^${name}$" --format "{{.Names}}"`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return output.trim() === name;
  } catch {
    return false;
  }
}

export function startContainer(name: string): boolean {
  try {
    execSync(`docker start ${name}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function stopContainer(name: string): boolean {
  try {
    execSync(`docker stop ${name}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getContainerLogs(name: string, lines: number = 50): string {
  try {
    return execSync(`docker logs --tail ${lines} ${name}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
  } catch {
    return '';
  }
}
