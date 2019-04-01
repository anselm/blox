class BehaviorRenderer extends THREE.WebGLRenderer {
	constructor(props,blob) {
		if ( WEBGL.isWebGLAvailable() === false ) {
			document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			return
		}
		let renderer = super({antialias:true})
		renderer.setClearColor("#000000")
		renderer.setSize( window.innerWidth, window.innerHeight )
		this.scene = 0
		this.camera = 0
		document.body.appendChild( renderer.domElement )
		let render = () => {
			requestAnimationFrame( render )
			if(!this.scene || !this.camera) return
			blob._tick_behaviors()
			renderer.render(this.scene,this.camera)
		}
		render()		
	}
}

class BehaviorScene extends THREE.Scene {
	constructor(props,blob) {
		let scene = super()
		blob._observe_attach(childBlob => {
			Object.entries(childBlob).forEach(([key,value])=>{
				if(value instanceof THREE.PerspectiveCamera) {
					console.log("Scene: noticed a camera being added")
					blob.renderer.camera = value // slight hack, tell the renderer where useful details are
					blob.renderer.scene = this
				}
				if(value instanceof THREE.Object3D) {
					console.log("Scene: adding object " + value.constructor.name )
					scene.add(value)
				}
			})
		})
	}
}

class BehaviorCamera extends THREE.PerspectiveCamera {
	constructor(props,blob) {
		let camera = super( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		camera.position.set( 20, 5, 10 )
		camera.lookAt(0,0,0)
		var light = new THREE.PointLight( 0xff0000, 1, 100 )
		camera.add(light)
	}
}

class BehaviorOrbit {
	constructor(props,blob) {
		// right now the camera is attached to the scene blob, it could be a child TODO
		let controls = this.controls = new THREE.OrbitControls( blob.camera, blob.parent.renderer.domElement )
		controls.minDistance = 10
		controls.maxDistance = 500
	}
}


class BehaviorLight extends THREE.DirectionalLight {
	constructor(props,blob) {

		// instance directional light
		super(props)

		// adjust scale and position
		if(props.position) this.position.set(props.position.x,props.position.y,props.position.z)

		this.target.position.set(0,0,0)
		this.castShadow = true

		// debug - make a visible representation
		let geometry = new THREE.SphereGeometry( 3, 16, 16 )
		let material = new THREE.MeshBasicMaterial( {color: 0xffff00 } )
		let mesh = new THREE.Mesh(geometry,material)
		this.add(mesh)
	}
}

