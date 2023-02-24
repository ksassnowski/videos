import { Node } from "@motion-canvas/2d/lib/components";
import { Direction, Vector2 } from "@motion-canvas/core/lib/types";
import { debug } from "@motion-canvas/core/lib/utils";

/**
 * Position the provided node next to the target node.
 *
 * @param node - The node to position
 * @param target - The node next to which to position the given node
 * @param direction - The direction the node should be offset from the target
 *                    node.
 * @param buffer - The buffer to apply between the two nodes
 */
export function nextTo(
  node: Node,
  target: Node,
  direction: Direction,
  buffer: number = 30,
) {
  const rect = node.cacheRect();
  const targetRect = target.cacheRect();
  let targetPosition = target.absolutePosition();

  switch (direction) {
    case Direction.Bottom:
      targetPosition = targetPosition.add(
        Vector2.up.scale(rect.height / 2 + targetRect.height / 2 + buffer),
      );
      break;
    case Direction.Left:
      targetPosition = targetPosition.add(
        Vector2.left.scale(rect.width + targetRect.width + buffer),
      );
      break;
    case Direction.Right:
      targetPosition = targetPosition.add(
        Vector2.right.scale(rect.width + targetRect.width + buffer),
      );
      break;
    case Direction.Top:
      targetPosition = targetPosition.add(
        Vector2.down.scale(rect.height + targetRect.height + buffer),
      );
      break;
  }

  node.absolutePosition(targetPosition);
}
