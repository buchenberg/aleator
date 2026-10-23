export const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const rollDie = () => DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)];

export const newSeed = () => Math.random().toString(36).slice(2, 8);
