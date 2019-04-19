

export class BehaviorRenderer extends THREE.WebGLRenderer {
	constructor(args) {
		let props = args.description || {}
		let blox = args.blox
		super({antialias:true,alpha:XRSupport.supportsARKit()})
		this.setSize( window.innerWidth, window.innerHeight )
		this.props = props
		this.blox = blox
		this.clock = new THREE.Clock()
		this.scene = 0
		this.camera = 0
		this.pov = 0

		// supports VR? HACK
		let usevr = window.supportsVR ? true : false

		this.PASSTHROUGH = XRSupport.supportsARKit()
		if(!this.PASSTHROUGH && !usevr) {
			document.body.appendChild( this.domElement )
			this.setAnimationLoop( this.render3.bind(this) )
		} else {
			this.xr = new XRSupport({
				renderer:this,
				updatePOV:this.updatePOV.bind(this),
				updateCamera:this.updateCamera.bind(this),
				updateScene:this.updateScene.bind(this),
				renderScene:this.renderScene.bind(this),
				createVirtualReality:usevr ? true : false,
				shouldStartPresenting:true,
				useComputervision:false,
				worldSensing:usevr ? false : true,
				alignEUS:usevr ? false : true
			})
		}
	}

	updatePOV(viewMatrix) {
		if(!this.pov) return
		this.pov.matrixAutoUpdate = false
		this.pov.matrix.fromArray(viewMatrix)
		this.pov.updateMatrixWorld()
	}

	updateCamera(projectionMatrix) {
		if(!this.camera) return
		this.camera.projectionMatrix.fromArray(projectionMatrix)
	}

	updateScene() {
		if(!this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})
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

	reset(scene,camera,pov) {
		this.scene = scene
		this.camera = camera
		this.pov = camera
	}
}
