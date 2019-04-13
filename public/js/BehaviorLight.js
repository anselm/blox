export class BehaviorLight extends THREE.DirectionalLight {
	constructor(props,blox) {

		// instance directional light
		super(props)

		// adjust scale and position
		if(props.position) this.position.set(props.position.x,props.position.y,props.position.z)

		this.target.position.set(0,0,0)
		this.castShadow = true

		// debug - make a visible representation
		let color = props.color || 0xFFFF00
		let geometry = new THREE.SphereGeometry( 3, 16, 16 )
		let material = new THREE.MeshBasicMaterial( {color: color } )
		let mesh = new THREE.Mesh(geometry,material)
		this.add(mesh)
	}
}
