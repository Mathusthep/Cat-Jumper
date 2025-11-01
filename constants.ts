// Game Area Dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const GROUND_HEIGHT = 40;

// Cat Properties
export const CAT_WIDTH = 60;
export const CAT_HEIGHT = 55;
export const CAT_INITIAL_X = 50;
export const CAT_INITIAL_Y = 0; // Y position is height from the ground, starts at 0

// Physics
export const GRAVITY = -0.8;
export const JUMP_STRENGTH = 17;

// Difficulty Settings
export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export interface DifficultySettings {
    initialSpeed: number;
    speedIncreaseRate: number;
    minSpawnGap: number;
    maxSpawnGap: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
    [Difficulty.Easy]: {
        initialSpeed: 4,
        speedIncreaseRate: 0.0003,
        minSpawnGap: 400,
        maxSpawnGap: 800,
    },
    [Difficulty.Medium]: {
        initialSpeed: 5,
        speedIncreaseRate: 0.0005,
        minSpawnGap: 350,
        maxSpawnGap: 700,
    },
    [Difficulty.Hard]: {
        initialSpeed: 6.5,
        speedIncreaseRate: 0.0007,
        minSpawnGap: 300,
        maxSpawnGap: 600,
    },
};


// Game Speed
export const MAX_GAME_SPEED = 15;

// Obstacles
export const OBSTACLE_WIDTH = 45;
export const OBSTACLE_HEIGHT = 45;

// Fish
export const FISH_WIDTH = 35;
export const FISH_HEIGHT = 20;
export const FISH_SPAWN_CHANCE = 0.4;
export const FISH_Y_POSITIONS = [
    30, 
    90, 
];

// Scoring & Lives
export const INITIAL_LIVES = 3;
export const POINTS_PER_SECOND = 1;
export const POINTS_PER_FISH = 10;
export const INVINCIBILITY_DURATION = 2000; // in milliseconds