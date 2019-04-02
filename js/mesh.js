
class BehaviorMesh extends THREE.Mesh {

	constructor(props,blob) {

		// TODO have a separate richer function that produces fancy objects from a string

		let is_gltf = 0
		let geometry = 0
		switch(props.art) {
			case "group":
				geometry = null
				break
			case "box":
				geometry = new THREE.BoxBufferGeometry(1,1,1,16,16,16)
				break
			case "sphere":
				geometry = new THREE.SphereGeometry(1,16,16)
				break
			default:
				is_gltf = 1
				geometry = new THREE.SphereGeometry(1,16,16)
				break
		}

		// instance this mesh
		let color = props.color || 0xff00ff
		let material = new THREE.MeshPhongMaterial( {color: color } )
		let mesh = super(geometry,material)

		// adjust scale and position
		if(props.scale) mesh.scale.set(props.scale.x,props.scale.y,props.scale.z)
		if(props.position) mesh.position.set(props.position.x,props.position.y,props.position.z)

		// observe children attach
		blob._observe_attach(childBlob => {
			Object.entries(childBlob).forEach(([key,value])=>{
				if(value instanceof THREE.Object3D) {
					mesh.add(value)
				}
			})
		})

		// was a simple geometry
		if(!is_gltf) {
			return
		}

		// load the gltf
		let url = props.art + "/scene.gltf"
		let loader = new THREE.GLTFLoader()

		loader.load(url, (gltf) => {

			if(!gltf || !gltf.scene) {
				return // oh well it tried - doesn't matter if fails
			}

			// start animations
	        if(gltf.animations && gltf.animations.length){
	            let mixer = new THREE.AnimationMixer(gltf.scene)
	            for(let animation of gltf.animations){
	                mixer.clipAction(animation).play()
	            }
	        }

			// center on self
			let bbox = new THREE.Box3().setFromObject(gltf.scene)
			let size = mesh.scale.length()
		    let resize = size / bbox.getSize(new THREE.Vector3()).length() * 2
		    let offset = bbox.getCenter(new THREE.Vector3()).multiplyScalar(resize)
		    gltf.scene.scale.set(resize,resize,resize)
		    gltf.scene.position.sub(offset)

		    // add to parent
			mesh.add(gltf.scene)

			// turn the top level material invisible to reveal the gltf only
			material.visible = false
		})
	}

}
