import {Bezier} from 'bezier-js';

interface LineInfo {
	type: "LINE";
	points: Point[];
	length: number;
}
interface BezierInfo {
	type: "CUBIC";
	bezier: Bezier;
	length: number;
	
}
export type BezierObject = (BezierInfo | LineInfo)[];

/**
 * turn whatever svg code is into array of bezier objects
 *  * note: figma doesnt have the 3 point bezier curve in vector mode, only 4 or 2.
 * @param svgData svg path data bruh moment
 * @returns array of array of points, eg [[point1,2,3,4],[4,5],[5,6,7,8]....]
 */
 export const svgToBezier = (svgData: string): BezierObject => {
	const path = svgData.replace('Z', '').split('M').slice(1) //split if more then 1 section and gets rid of the extra array value at front
	// throw error if theres too many lines becasue im lazy
	if (path.length > 1) throw 'This plugin only supports one continous vector!'

	const bezierChunks = path[0].trim().split(/ L|C /) // splits string into the chunks of different lines

	// the point to splice into the next curve
	let splicein: string[] = bezierChunks[0].trim().split(' ')

	// the output group of curves (which is a group of points)
	let bezierArray: (BezierInfo | LineInfo)[] = bezierChunks.splice(1).map(e => {
		//split each string in the chunk into points
		const splitPoints = [...splicein,...e.trim().split(' ')];
		
		//this adds the last point from the previous array into the next one.
		splicein = [splitPoints[splitPoints.length - 2],splitPoints[splitPoints.length - 2]]
		// turn string into numbers
		const numberPoints = splitPoints.map((value:string)=> {return parseFloat(value)})

		if (numberPoints.length == 8) {
			const curve = new Bezier(numberPoints) // clean this up later, typedpoints is redundant.
			const data:BezierInfo = {
				type: 'CUBIC',
				bezier: curve,
				length: curve.length()
			}
			return data;
		} else if (numberPoints.length == 4) {
			const linePoints = [{x:numberPoints[0], y:numberPoints[1]},{x:numberPoints[1], y:numberPoints[2]}]
			const data:LineInfo = {
				type: "LINE",
				points: linePoints,
				length: distBtwn(linePoints[0],linePoints[1])
			}
			return data;
		} else {
			throw 'Error Parsing SVG! Is the vector a valid SVG?'
		}
	})
	return bezierArray
}

/**
 * distance between points a and b
 * @param a first point
 * @param b second point
 */
 export const distBtwn = (a: Point, b: Point): number => { 
	return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2) 
}