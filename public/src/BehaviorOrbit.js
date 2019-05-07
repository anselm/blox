export class BehaviorOrbit extends THREE.OrbitControls{
	constructor(args) {
		let props = args.description
		let blox = args.blox
		// TODO it's a bit of a hack that this component knows or expects to find a camera in its own scope
		if(!blox.camera) {
			console.error("BehaviorOrbit requires a camera to be attached to the same group already")
			return 0
		}
		super(blox.camera)
		let lookat = props.lookat || {x:0,y:1,z:0}
		this.target = new THREE.Vector3(lookat.x,lookat.y,lookat.z)
		this.minDistance = props.minDistance || 50
		this.maxDistance = props.maxDistance || 500
		this.update()
	}
}
