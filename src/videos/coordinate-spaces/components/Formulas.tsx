import { Latex, LatexProps } from '@motion-canvas/2d/lib/components';

import { texColor } from '@common/utils';

import theme from '@theme';

export const vectorTex = `
\\begin{bmatrix}
300 \\\\
-200
\\end{bmatrix}
`;

export const rMatrixTex = `
\\begin{bmatrix}
R_x \\\\
R_y \\\\
1
\\end{bmatrix}
`;

export const simpleFormulaTex = `
circlePos(P, R) = \\begin{bmatrix}
P_x + R_x \\\\ 
P_y + R_y
\\end{bmatrix}
`;

export const translationMatrixTex = `
\\begin{bmatrix}
1 & 0 & P_x \\\\ 
0 & 1 & P_y \\\\ 
0 & 0 & 1
\\end{bmatrix}
`;

export const scalingMatrixTex = `
\\begin{bmatrix}
S_x & 0 & 0 \\\\ 
0 & S_y & 0 \\\\ 
0 & 0 & 1
\\end{bmatrix}
`;

export const scalingTranslationMatrixTex = `
\\begin{bmatrix}
S_x & 0 & P_x \\\\
0 & S_y & P_y \\\\
0 & 0 & 1 \\\\
\\end{bmatrix}
`;

export const rotationMatrixTex = `
\\begin{bmatrix}
\\cos\\theta & -\\sin\\theta & 0 \\\\
\\sin\\theta & \\cos\\theta & 0 \\\\
0 & 0 & 1 \\\\
\\end{bmatrix}
`;

export const translationToOriginTex = `
\\begin{bmatrix}
1 & 0 & -P_x \\\\
0 & 1 & -P_y \\\\
0 & 0 & 1 \\\\
\\end{bmatrix}
`;

export const undoTranslationToOriginTex = `
\\begin{bmatrix}
1 & 0 & P_x \\\\
0 & 1 & P_y \\\\
0 & 0 & 1 \\\\
\\end{bmatrix}
`;

export const rotationMatrixSeparateTex = `${undoTranslationToOriginTex}${rotationMatrixTex}${translationToOriginTex}`;

export const translationMatrixFormulaTex = `
circlePos(P, R) = ${translationMatrixTex}${rMatrixTex}
`;

export const scalingTranslationFormulaTex = `
circlePos(P, R, S) = ${translationMatrixTex}${scalingMatrixTex}${rMatrixTex}
`;

export const scalingTranslationFormulaCombinedTex = `
circlePos(P, R, S) = ${scalingTranslationMatrixTex}${rMatrixTex}
`;

export const rotationMatrixCombinedTex = `
\\begin{bmatrix}
\\cos \\theta & -\\sin \\theta & P_x - P_x \\cdot \\cos \\theta + P_y \\cdot \\sin \\theta \\\\ 
\\sin \\theta & \\cos \\theta & P_y - P_y \\cdot \\cos \\theta - P_x \\cdot \\sin\\theta
\\\\ 0 & 0 & 1\\end{bmatrix}
`;

export const localToParentTex = `
\\begin{bmatrix}
S_x \\cdot \\cos\\theta & -S_y \\cdot \\sin\\theta & P_x \\\\
S_x \\cdot \\sin\\theta & S_y \\cdot \\cos\\theta & P_y \\\\
0 & 0 & 1
\\end{bmatrix}
`;

export const finalFormulaSeparateTex = `
circlePos(P, R, S, \\theta) = ${rotationMatrixCombinedTex}${scalingTranslationMatrixTex}${rMatrixTex}
`;

export const localToParentFormula = `
circlePos(P, R, S, \\theta) = ${localToParentTex}${rMatrixTex}
`;

export const RelativePositionVector = (props: LatexProps) => (
  <Latex tex={texColor(vectorTex, theme.colors.White)} {...props} />
);

export const SimpleFormula = (props: LatexProps) => (
  <Latex tex={texColor(simpleFormulaTex, theme.colors.White)} {...props} />
);

export const TranslationMatrixFormula = (props: LatexProps) => (
  <Latex
    tex={texColor(translationMatrixFormulaTex, theme.colors.White)}
    {...props}
  />
);

export const ScalingMatrix = (props: LatexProps) => (
  <Latex tex={texColor(scalingMatrixTex, theme.colors.White)} {...props} />
);

export const RotationMatrix = (props: LatexProps) => (
  <Latex tex={texColor(rotationMatrixTex, theme.colors.White)} {...props} />
);
