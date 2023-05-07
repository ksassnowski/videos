import theme from '@theme';

export function texColor(
  tex: string,
  color: string,
  previousColor: string = theme.colors.White,
): string {
  let result = `\\color{${color}}{${tex}}`;

  if (color !== previousColor) {
    result += `\\color{${previousColor}}`;
  }

  return result;
}
