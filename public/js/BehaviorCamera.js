export class BehaviorCamera extends THREE.PerspectiveCamera {
	constructor(args) {
		let props = args.description || {}
		let blox = args.blox
		let camera = super( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		let position = props.position || {x:0,y:1,z:10}
		let lookat = props.lookat || {x:0,y:1,z:0}
		camera.position.set(position.x,position.y,position.z)
		camera.lookAt(lookat.x,lookat.y,lookat.z)
		var light = new THREE.PointLight( 0xffffff, 1, 100 )
		camera.add(light)
	}
}
