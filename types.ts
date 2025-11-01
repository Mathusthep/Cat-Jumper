
export enum GameState {
  Start,
  Playing,
  GameOver,
}

export interface GameObject {
  id: number;
  x: number;
  width: number;
}

export interface ObstacleType extends GameObject {
  height: number;
}

export interface FishType extends GameObject {
  y: number;
  height: number;
}
   