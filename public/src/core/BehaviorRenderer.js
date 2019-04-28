
import {XRSupport} from "./XRSupport.js"

export class BehaviorRenderer {

	constructor() {

		this.scene = 0
		this.camera = 0
		this.clock = new THREE.Clock()

		if(XRSupport.supportsARKit()) {
			this.xr = new XRSupport(this.renderXR.bind(this))
		} else {
			this.device = 0
			this.canvas = document.createElement('canvas')
			this.context = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })
			this.renderer = new THREE.WebGLRenderer({canvas:this.canvas,context:this.context,antialias:false,alpha:false})
			this.renderer.setSize( window.innerWidth, window.innerHeight )
			this.renderer.autoClear = false
			this.renderer.setPixelRatio(1)
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

		if(!this.renderer) {
			this.device = 0
			this.canvas = canvas
			this.context = context
			this.renderer = new THREE.WebGLRenderer({canvas:canvas,context:context,antialias:true,alpha:false})
			this.renderer.setSize( window.innerWidth, window.innerHeight )
			this.renderer.autoClear = false
			this.renderer.setPixelRatio(1)
		}

		if(!this.renderer || !this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})

		this.camera.matrixAutoUpdate = false
		this.camera.matrix.fromArray(viewMatrix)
		this.camera.updateMatrixWorld()
		this.camera.projectionMatrix.fromArray(projectionMatrix)

		// TODO why does this get reset to 0?
		let width = this.xr.session.baseLayer.framebufferWidth
		let height = this.xr.session.baseLayer.framebufferHeight
		if(width <10 || height < 10 ) {
			width = window.innerWidth
			height = window.innerHeight
		}
		this.renderer.setSize(width,height,false)
		this.renderer.setViewport(0,0,width,height) //viewport.x, viewport.y, viewport.width, viewport.height)

	this.renderer.clear()

		this.renderer.clearDepth()

		this.renderer.render(this.scene, this.camera)
	}


}
