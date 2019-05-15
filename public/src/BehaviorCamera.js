export class BehaviorCamera extends THREE.PerspectiveCamera {
	constructor(args) {
		let props = args.description || {}
		let blox = args.blox
		let camera = super( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		let position = props.position || {x:0,y:40,z:120}
		let lookat = props.lookat || {x:0,y:1,z:0}
		camera.position.set(position.x,position.y,position.z)
		camera.lookAt(lookat.x,lookat.y,lookat.z)
		var light = new THREE.PointLight( 0xffffff, 1, 100 )
		camera.add(light)

		// these get exposed in blox

		if(blox.mesh) console.error("Warning: mesh already assigned")
//		blox.mesh = camera // TODO some kind of bug is related to this being assigned - forever loop
		blox.position = camera.position
		blox.quaternion = camera.quaternion

		// TODO hack - this line is only needed if I am directly decorating the root of the scene graph with a raw camera behavior
		// I'm thinking that I'd like some formalism for letting any new camera attach itself to the renderer
		// The normal way cameras are attached to the renderer is by the scene noticing them show up and telling the renderer itself
		if(blox.renderer) blox.renderer.set_camera(this)
	}
}
