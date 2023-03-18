import { rotate, translate, compose } from "transformation-matrix";
import type { Matrix } from "transformation-matrix";
import type { BezierObject } from "./curve";
import type { optionsType, Point } from "../../config";
import { getPointfromCurve } from "./curve";
export const place = (
  node: SceneNode, // to clone
  curveNode: VectorNode,
  curve: BezierObject[],
  options: optionsType,
  groupNode: GroupNode = undefined,
  position = 0
) => {
  const totalLength = curve[curve.length - 1].cumulative;
  const totalCount = options.count;
  const spacing = options.autoWidth
    ? totalLength / (totalCount - 1)
    : options.spacing;

  let clonedNodes = [];
  let curvePos = 0;

  for (var count = position; count < totalCount; count++) {
    // select curve based on spacing
    const position = spacing * count;
    if (position > totalLength) break;
    if (position > curve[curvePos].cumulative) {
      curvePos += 1;
    }
    const current = curve[curvePos];

    const t =
      (position - (current.cumulative - current.length)) / current.length;
    const { angle, point } = getPointfromCurve(current, t);
    let object =
      node.type === "COMPONENT" ? node.createInstance() : node.clone();

    curveNode.parent.appendChild(object);
    const center: Point = {
      x: 0 - object.width * options.horizontalAlign, // no horozonatal align on text, kerning gets fucked up
      y: 0 - object.height * options.verticalAlign,
    };

    const baseMatrix = FigmaMatrixToObj(curveNode.relativeTransform);
    const matrix = compose(
      baseMatrix,
      translate(point.x, point.y),
      rotate(angle),
      translate(center.x, center.y)
    );

    object.relativeTransform = ObjToFigmaMatrix(matrix);
    clonedNodes = [...clonedNodes, object];
  }

  const group = figma.flatten(clonedNodes, curveNode.parent);
  group.opacity = 0.4;
  group.locked = true;

  return group;
};

/**
 * convert figma matrix into one I can consume (I ate!!!)
 * @param m figma matrix array
 * @returns matrix object
 */
export const FigmaMatrixToObj = (m: Transform): Matrix => {
  return {
    a: m[0][0],
    c: m[0][1],
    e: m[0][2],
    b: m[1][0],
    d: m[1][1],
    f: m[1][2],
  };
};

/**
 * convert matrix object into figma matrix (I ate!!!)
 * @param m figma matrix array
 * @returns matrix object
 */
export const ObjToFigmaMatrix = (m: Matrix): Transform => {
  return [
    [m.a, m.c, m.e],
    [m.b, m.d, m.f],
  ];
};

/**
 * find point between two points a and b over time
 * *in this case time is pixels
 * @param a point a
 * @param b point b
 * @param t current time
 * @param dist total time
 */
export const pointBtwn = (a: Point, b: Point, t: number): Point => {
  //find the unit  vector between points a and b
  // not really unit vector in the math sense tho
  //const unitVector: Point = { x: , y: }
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
};