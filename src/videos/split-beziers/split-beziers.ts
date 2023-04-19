import { makeProject } from '@motion-canvas/core';

import audio from '../../../audio/bezier_vo2.wav';
import intro from './scenes/intro?scene';
import lerp from './scenes/lerp?scene';

export default makeProject({
  name: 'split-beziers',
  scenes: [lerp],
  audio: audio,
});
