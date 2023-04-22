import { makeProject } from '@motion-canvas/core';

import collideWithPhysics from './scenes/collide-with-physics?scene';
import intro from './scenes/intro?scene';

export default makeProject({
  name: 'separating-axis-theorem',
  scenes: [intro, collideWithPhysics],
});
