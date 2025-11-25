import { AfferentStream } from './AfferentStreamGenerator';

class StreamStore {
  private streams: Map<string, AfferentStream[]> = new Map();

  addStream(userId: string, stream: AfferentStream): void {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, []);
    }

    const userStreams = this.streams.get(userId)!;
    userStreams.push(stream);

    const maxStreams = 100;
    if (userStreams.length > maxStreams) {
      this.streams.set(userId, userStreams.slice(-maxStreams));
    }
  }

  getStreams(userId: string): AfferentStream[] {
    return this.streams.get(userId) || [];
  }

  getAllStreams(): AfferentStream[] {
    const allStreams: AfferentStream[] = [];
    this.streams.forEach((userStreams) => {
      allStreams.push(...userStreams);
    });
    return allStreams;
  }

  getUserCount(): number {
    return this.streams.size;
  }

  getTotalStreamCount(): number {
    let total = 0;
    this.streams.forEach((userStreams) => {
      total += userStreams.length;
    });
    return total;
  }
}

export const streamStore = new StreamStore();