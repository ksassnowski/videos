import { makeProject } from '@motion-canvas/core';

import audio from '../../../audio/coordinate-spaces.wav';
import dropGoblin from './scenes/drop-goblin?scene';
import goblinBowling from './scenes/goblin-bowling?scene';
import intro from './scenes/intro?scene';
import local from './scenes/local?scene';
import matrix from './scenes/matrix?scene';
import rotation from './scenes/rotation?scene';
import scalingMatrix from './scenes/scaling-matrix?scene';
import scaling from './scenes/scaling?scene';
import sceneTree from './scenes/scene-tree?scene';
import transform from './scenes/transform?scene';
import updateFormulaRotation from './scenes/update-formula-rotation?scene';

export default makeProject({
  name: 'coordinate-spaces',
  scenes: [
    intro,
    sceneTree,
    transform,
    dropGoblin,
    matrix,
    local,
    goblinBowling,
    scaling,
    scalingMatrix,
    updateFormulaRotation,
    rotation,
  ],
  audio,
});
