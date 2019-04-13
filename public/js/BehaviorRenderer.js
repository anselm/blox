

export class BehaviorRenderer extends THREE.WebGLRenderer {
	constructor(props,blox) {
		super({antialias:true,alpha:XRSupport.supportsARKit()})
		this.setSize( window.innerWidth, window.innerHeight )
		this.props = props
		this.blox = blox
		this.clock = new THREE.Clock()
		this.scene = 0
		this.camera = 0
		this.pov = 0

		this.PASSTHROUGH = XRSupport.supportsARKit()
		if(!this.PASSTHROUGH) {
			document.body.appendChild( this.domElement )
			this.setAnimationLoop( this.render3.bind(this) )
		} else {
			this.xr = new XRSupport({
				renderer:this,
				updatePOV:this.updatePOV.bind(this),
				updateCamera:this.updateCamera.bind(this),
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
		this.blox.event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})
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

export class BehaviorCamera extends THREE.PerspectiveCamera {
	constructor(props,blox) {
		let camera = super( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		let position = props.position || {x:0,y:1,z:10}
		let lookat = props.lookat || {x:0,y:1,z:0}
		camera.position.set(position.x,position.y,position.z)
		camera.lookAt(lookat.x,lookat.y,lookat.z)
		var light = new THREE.PointLight( 0xffffff, 1, 100 )
		camera.add(light)
	}
}

export class BehaviorScene extends THREE.Scene {
	constructor(props,blox) {
		super()
		// force add a renderer by hand if not added
		if(!blox.renderer) {
			this.renderer = blox.renderer = new BehaviorRenderer({},blox)
		}
		// force add a default camera by hand - can be overridden
		this.camera = blox.camera = new BehaviorCamera({},blox)
		// set renderer to use this scene and default camera for now
		this.renderer.reset(this,this.camera,this.camera)
	}
	on_blox_added(args) {
		let scene = this
		let child = args.child
		let objects = child.query({instance:THREE.Object3D,all:true})
		objects.forEach((value)=>{
			// any children behaviors that are actually threejs objects just get added to the scene
			if(value instanceof THREE.Object3D) {
				scene.add(value)
			}
			// also if a camera shows up, go ahead and use it instead
			// TODO note that this does not notice cameras coming in as children of children etc - need a more global event system
			if(value instanceof THREE.PerspectiveCamera) {
				console.log("Scene: noticed another camera being added - using that instead")
				// tell renderer about new camera
				this.renderer.reset(this,value,value)
			}
		})
	}
}

