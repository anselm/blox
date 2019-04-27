
let heart_geometry = 0

import {BehaviorMesh} from './BehaviorMesh.js'

export class BehaviorHeart extends BehaviorMesh {

	constructor(args) {
		let props = args.description
		let blox = args.blox
		super(args)
	}

	setCustomGeometry() {
		if(heart_geometry) return heart_geometry
		let x = 0, y = 0
		let shape = new THREE.Shape()
		shape.moveTo( x + .5, y + .5 )
		shape.bezierCurveTo( x + .5, y + .5, x + .4, y, x, y )
		shape.bezierCurveTo( x - .6, y, x - .6, y + .7,x - .6, y + .7 )
		shape.bezierCurveTo( x - .6, y + 1.1, x - .3, y + 1.54, x + .5, y + 1.9 )
		shape.bezierCurveTo( x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + .7 )
		shape.bezierCurveTo( x + 1.6, y + .7, x + 1.6, y, x + 1.0, y )
		shape.bezierCurveTo( x + .7, y, x + .5, y + .5, x + .5, y + .5 )
		//let extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }
		//heart_geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
		//heart_geometry = new THREE.ShapeGeometry( shape )
		heart_geometry = new THREE.ShapeBufferGeometry( shape )
		this.madeGeometry = true
		return heart_geometry
	}
}
