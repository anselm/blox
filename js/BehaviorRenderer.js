

export class BehaviorRenderer extends THREE.WebGLRenderer {
	constructor(props,blob) {
		super({antialias:true,alpha:XRSupport.supportsARKit()})
		this.setSize( window.innerWidth, window.innerHeight )
		this.props = props
		this.blob = blob
		this.clock = new THREE.Clock()
		this.scene = 0
		this.camera = 0
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

	start(scene,camera) {
		this.scene = scene
		this.camera = camera
		this.PASSTHROUGH = XRSupport.supportsARKit()
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

export class BehaviorScene extends THREE.Scene {
	constructor(props,blob) {
		let scene = super()
		blob._observe_attach(childBlob => {
			Object.entries(childBlob).forEach(([key,value])=>{
				if(value instanceof THREE.PerspectiveCamera) {
					console.log("Scene: noticed a camera being added")
					// add renderer if none - actually avoid this because i'd prefer to not have race conditions with xrsupport
					//if(!blob.renderer) blob.renderer = new BehaviorRenderer(0,blob)
					// slight hack - tell renderer about scene and camera
					blob.renderer.start(this,value)
				}
				if(value instanceof THREE.Object3D) {
					console.log("Scene: adding object " + value.constructor.name )
					scene.add(value)
				}
			})
		})
	}
}

export class BehaviorCamera extends THREE.PerspectiveCamera {
	constructor(props,blob) {
		let camera = super( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		let position = props.position || {x:0,y:1,z:10}
		let lookat = props.lookat || {x:0,y:1,z:0}
		camera.position.set(position.x,position.y,position.z)
		camera.lookAt(lookat.x,lookat.y,lookat.z)
		var light = new THREE.PointLight( 0xffffff, 1, 100 )
		camera.add(light)
	}
}

export class BehaviorLight extends THREE.DirectionalLight {
	constructor(props,blob) {

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
