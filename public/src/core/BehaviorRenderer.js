
import {XRSupport} from "./XRSupport.js"

export class BehaviorRenderer {

	constructor() {

		this.scene = 0
		this.camera = 0
		this.canvas = 0
		this.context = 0
		this.renderer = 0
		this.clock = new THREE.Clock()

		if(XRSupport.supportsARKit()) {
			this.xr = new XRSupport(this.canvas,this.context,this.renderXR.bind(this))
		} else {
			this.canvas = document.createElement('canvas')
			this.context = this.canvas.getContext('webgl', { compatibleXRDevice: 0 })
			this.renderer = new THREE.WebGLRenderer({canvas:this.canvas,context:this.context,antialias:false,alpha:false})
			this.renderer.setSize( window.innerWidth, window.innerHeight )
			//this.renderer.autoClear = false
			//this.renderer.setPixelRatio(1)
			document.body.appendChild( this.renderer.domElement )
			this.renderer.setAnimationLoop( this.renderDesktop.bind(this) )
		}
	}

	set_scene(scene) {
		this.scene = scene
	}

	set_camera(camera) {
		this.camera = camera
	}

	renderVR() {
		// TBD
	}

	renderDesktop() {
		if(!this.renderer || !this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})
		this.renderer.render(this.scene,this.camera)
	}

	renderXR(canvas,context,viewport,projectionMatrix,viewMatrix) {

		let x = 0
		let y = 0
		let width = viewport.width
		let height = viewport.height

		if(!this.renderer) {
			this.canvas = canvas
			this.context = context
			this.renderer = new THREE.WebGLRenderer({canvas:canvas,context:context,antialias:true,alpha:false})
			this.renderer.setSize(width,height)
			this.renderer.autoClear = false
			this.renderer.setPixelRatio(1)
			this.renderer.setViewport(x,y,width,height)
		}

		if(this.canvas.width != width || this.canvas.height != height) {
			this.canvas.width = width
			this.canvas.height = height
		}

		if(!this.renderer || !this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})

		this.camera.matrixAutoUpdate = false
		this.camera.matrix.fromArray(viewMatrix)
		this.camera.updateMatrixWorld()
		this.camera.projectionMatrix.fromArray(projectionMatrix)

		//this.renderer.clear()

		this.renderer.clearDepth()

		this.renderer.render(this.scene, this.camera)
	}


}
