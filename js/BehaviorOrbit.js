export class BehaviorOrbit extends THREE.OrbitControls{
	constructor(props,blob) {
		super(blob.camera)
		let lookat = props.lookat || {x:0,y:1,z:0}
		this.target = new THREE.Vector3(lookat.x,lookat.y,lookat.z)
		this.minDistance = 50
		this.maxDistance = 500
		this.update()
	}
}
