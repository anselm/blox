
console.log(XRSupport)

class BehaviorRenderer extends THREE.WebGLRenderer {
	constructor(props,blob) {
		super({antialias:true,alpha:true})
		this.setSize( window.innerWidth, window.innerHeight )
		this.props = props
		this.blob = blob
		this.clock = new THREE.Clock()
		this.scene = 0
		this.camera = 0
		this.PASSTHROUGH = XRSupport.supportsARKit()
	}

	updateScene() {
		if(!this.scene || !this.camera) return
		this.blob._tick(this.clock.getElapsedTime())
	}

	renderScene() {
		if(!this.scene || !this.camera) return
		this.render(this.scene,this.camera)			
	}

	render3() {
		if(!this.scene || !this.camera) return
		this.updateScene()
		this.renderScene()
	}

	start() {
		console.log("starting render")
		if(!this.PASSTHROUGH) {
			document.body.appendChild( this.domElement )
			this.setAnimationLoop( this.render3.bind(this) )
		} else {
			this.xr = new XRSupport({
				camera:this.camera,
				renderer:this,
				updateScene:this.updateScene.bind(this),
				renderScene:this.renderScene.bind(this),
				createVirtualReality:false,
				shouldStartPresenting:true,
				useComputervision:false,
				worldSensing:true,
				alignEUS:true
			})
		}
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
					blob.renderer.start()
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

class BehaviorOrbit {
	constructor(props,blob) {
		// right now the camera is attached to the scene blob, it could be a child TODO
		let controls = this.controls = new THREE.OrbitControls( blob.camera, blob.parent.renderer.domElement )
		controls.minDistance = 10
		controls.maxDistance = 500
	}
}
