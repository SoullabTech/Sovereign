// Types for @/types/extensions
declare module '@/types/extensions' {
  export interface CompassState {
    currentPanel: 'right' | 'left' | 'up' | 'down' | 'center';
    previousPanel?: 'right' | 'left' | 'up' | 'down' | 'center';
    suggestions: string[];
    available: ('right' | 'left' | 'up' | 'down')[];
  }

  export interface NavigationHint {
    id: string;
    direction: 'right' | 'left' | 'up' | 'down';
    label: string;
    priority?: number;
  }
}
