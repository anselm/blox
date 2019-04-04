
let heart_geometry = 0

export class BehaviorHeart extends THREE.Mesh {

	constructor() {
		// TODO improve colors - pass as an argument
		let r = Math.floor(Math.random()*100 + 135)
		let g = Math.floor(Math.random()*100 + 19)
		let b = Math.floor(Math.random()*100 + 101)
		let c = r *65536 + g * 256 + b
		let material = new THREE.MeshPhongMaterial( { transparent: true, side: THREE.DoubleSide, color: c } )
		let geometry = BehaviorHeart.geometry()
		var mesh = new THREE.Mesh(geometry,material)
		// TODO pass scale as an arg
		mesh.scale.set(0.1,0.1,0.1)
		return mesh
	}

	static geometry() {
		if(heart_geometry) return heart_geometry
		var x = 0, y = 0
		var shape = new THREE.Shape()
		shape.moveTo( x + 5, y + 5 )
		shape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y )
		shape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 )
		shape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 )
		shape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 )
		shape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y )
		shape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 )
		var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }
		//heart_geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
		//heart_geometry = new THREE.ShapeGeometry( shape )
		heart_geometry = new THREE.ShapeBufferGeometry( shape )
		return heart_geometry
	}
}