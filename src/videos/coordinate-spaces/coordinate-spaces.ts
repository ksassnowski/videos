import { makeProject } from '@motion-canvas/core';

import audio from '../../../audio/coordinate-spaces.wav';
import absolutePosition from './scenes/absolute-position?scene';
import bloodSpatter from './scenes/blood-spatter?scene';
import coordinateSpacesExample from './scenes/coordinate-spaces-example?scene';
import coordinates from './scenes/coordinates?scene';
import demonstration from './scenes/demonstration?scene';
import dropGoblin from './scenes/drop-goblin?scene';
import goblinBowling from './scenes/goblin-bowling?scene';
import intro from './scenes/intro?scene';
import localToParent from './scenes/local-to-parent?scene';
import local from './scenes/local?scene';
import matrix from './scenes/matrix?scene';
import multipleCoordinateSystems from './scenes/multiple-coordinate-systems?scene';
import outro from './scenes/outro?scene';
import relative from './scenes/relative?scene';
import rotation from './scenes/rotation?scene';
import scalingMatrix from './scenes/scaling-matrix?scene';
import scaling from './scenes/scaling?scene';
import sceneTree from './scenes/scene-tree?scene';
import simplifyRotation from './scenes/simplify-rotation?scene';
import transform from './scenes/transform?scene';
import updateFormulaScaling from './scenes/update-formula-scaling?scene';

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
    updateFormulaScaling,
    rotation,
    simplifyRotation,
    demonstration,
    absolutePosition,
    coordinates,
    relative,
    multipleCoordinateSystems,
    coordinateSpacesExample,
    localToParent,
    bloodSpatter,
    outro,
  ],
  audio,
});
