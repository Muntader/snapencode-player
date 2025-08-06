// src/player/index.ts

// Step 1: Import the component that has a default export.
import Player from './Player';

// Step 2: Import any types you want to export.
import type { Configuration } from './types';

// Step 3: Export the types as NAMED exports.
export type { Configuration };

// Step 4: Export the Player component as the one and only DEFAULT export.
export default Player;
