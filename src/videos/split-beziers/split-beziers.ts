import { makeProject } from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import lerp from './scenes/lerp?scene';

export default makeProject({
  name: 'split-beziers',
  scenes: [lerp],
  background: '#141414',
});
