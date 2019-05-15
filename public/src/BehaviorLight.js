export class BehaviorLight extends THREE.Group {
	constructor(args) {
		let props = args.description
		let blox = args.blox

		super()

		if(props.position) {
			this.position.set(props.position.x,props.position.y,props.position.z)
		}

		let light = 0
		let style = props.style || ""
		switch(style) {
		case "point":
			light = new THREE.PointLight(0xffffff, 1, 1000)
			light.intensity = props.intensity || 1
			break
		default:
			light = new THREE.DirectionalLight()
			light.target.position.set(0,0,0)
			light.castShadow = true
			break
		}
		this.add(light)

		// debug - make a visible representation
		if(props.debug) {
			let color = props.color || 0xFFFF00
			let geometry = new THREE.SphereGeometry( 3, 16, 16 )
			let material = new THREE.MeshBasicMaterial( {color: color } )
			let mesh = new THREE.Mesh(geometry,material)
			this.add(mesh)
		}

		// these get exposed in blox
		if(blox.mesh) console.error("Warning: mesh already assigned")
		blox.mesh = this
		blox.position = this.position
		blox.quaternion = this.quaternion
	}
}
