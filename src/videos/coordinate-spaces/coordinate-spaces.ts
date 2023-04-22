import { makeProject } from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import relative from './scenes/relative?scene';
import transform from './scenes/transform?scene';

export default makeProject({
  name: 'coordinate-spaces',
  scenes: [intro, relative, transform],
});
