
import {XRInputManager} from '../lib/XRInputManager.js'
import {XRSupport} from '../lib/XRSupport.js'

export class BehaviorRenderer {

	constructor() {

		// make this globally available
		document.blox_renderer = this

		this.clock = new THREE.Clock()
		this.canvas = document.createElement('canvas')
		this.scene = 0
		this.camera = 0
		this.composer = 0
		this.selectedObjects = []

		if(XRSupport.supportsARKit()) {
			this.xr = new XRSupport()
			this.xr.getContext(this.canvas).then((context) => {
				this.setupRenderer(0,this.canvas,context)
				this.xr.setAnimationLoop( this.animateWithCamera.bind(this) )
			}).catch(err => {
				console.error('Error', err)
			})
		} else {
			this.setupRenderer(0,this.canvas,0)
			this.renderer.setAnimationLoop( this.animate.bind(this) )
			document.body.appendChild( this.canvas )
		}
	}

	setupRenderer(bounds,canvas,context) {

		let width = bounds ? bounds.width : window.innerWidth
		let height = bounds ? bounds.height : window.innerHeight

		this.canvas = canvas
		this.context = context

		this.renderer = new THREE.WebGLRenderer({canvas:this.canvas,context:this.context,antialias:false,alpha:false})
		this.renderer.autoClear = false
		this.renderer.setPixelRatio(1)
		this.renderer.setSize(width,height) // TODO this may not be needed? test

		//this.renderTarget = new THREE.WebGLRenderTarget( width, height,{
		//	minFilter: THREE.LinearFilter,
		//	magFilter: THREE.LinearFilter,
		//	format: THREE.RGBFormat,
		//	stencilBuffer: true
		//})
		//this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget )

		this.composer = new THREE.EffectComposer( this.renderer )
		this.composer.setSize( width, height ) // TODO this may not be needed?

		this.renderPass = new THREE.RenderPass( this.scene, this.camera )
		this.composer.addPass( this.renderPass )
		//this.renderPass.clear = false

		let outlinePass = this.outlinePass = new THREE.OutlinePass( new THREE.Vector2( width, height ), this.scene, this.camera )
		// outlinePass.edgeStrength = Number( 5 );
		// outlinePass.edgeGlow = Number( 1 );
		// outlinePass.edgeThickness = Number( 8 );
		// outlinePass.pulsePeriod = Number( 1 );
		// outlinePass.usePatternTexture =  true;
		// outlinePass.visibleEdgeColor.set( value );
		// outlinePass.hiddenEdgeColor.set( value );
		this.composer.addPass( this.outlinePass )
		this.outlinePass.selectedObjects = this.selectedObjects

		let loader = new THREE.TextureLoader();
		loader.load( './art/tri_pattern.jpg', (texture) => {
			this.outlinePass.patternTexture = texture;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;	
		});
		this.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.effectFXAA.renderToScreen = true;
		this.composer.addPass( this.effectFXAA );
	}

	/*
	test_stencil_buffers() {
		let camera = this.camera
		let composer = this.composer

		// first clear the screen
		composer.addPass( new THREE.ClearPass() )

		// portal
		let portal1 = new THREE.Mesh( new THREE.BoxBufferGeometry( 4, 8, 0.1 ) )
		let portal2 = new THREE.Mesh( new THREE.BoxBufferGeometry( 4, 8, 0.1 ) )

		// Mask - so that nothing outside the mask can be painted
		var scene1 = new THREE.Scene()
		scene1.add( portal1 )
		let mask = new THREE.MaskPass( scene1, camera )
		composer.addPass( mask )

		// Now render some geometry in the inner secret room
		let scene2 = new THREE.Scene()
		let m = new THREE.Mesh( new THREE.SphereGeometry(1,32,32) ) 
		m.position.z = 10
		scene2.add( m )
		this.renderPass2 = new THREE.RenderPass( scene2, this.camera )
		this.composer.addPass( this.renderPass2 )
		this.renderPass2.clear = false

		// remove mask
		composer.addPass( new THREE.ClearMaskPass() )

		// Make an inverse mask so that the insides are not touched
		var scene1 = new THREE.Scene()
		scene1.add( portal2 )
		let mask2 = new THREE.MaskPass( scene1, camera )
		mask2.inverse = true
		composer.addPass( mask2 )

		// render main scene on the outside of the room
		this.renderPass = new THREE.RenderPass( this.scene, this.camera )
		this.composer.addPass( this.renderPass )
		this.renderPass.clear = false

		// remove mask
		composer.addPass( new THREE.ClearMaskPass() )

		// copy to main
		composer.addPass( new THREE.ShaderPass( THREE.CopyShader ) )
	}
	*/

	set_scene(scene) {
		this.scene = scene
	}

	set_camera(camera) {
		this.camera = camera
		if(this.xr) {
			this.camera.matrixAutoUpdate = false
			this.xr.projectionMatrix = this.camera.projectionMatrix
		}
	}

	set_selected(mesh) {
		this.selectedObjects.push(mesh)
	}

	animate() {
		if(!this.scene || !this.camera) return

		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})

		if(this.renderPass) {
			this.renderPass.scene = this.scene
			this.renderPass.camera = this.camera
		}
		if(this.outlinePass) {
			this.outlinePass.renderScene = this.renderPass.scene = this.scene // works around a bug with changeable camera TODO
			this.outlinePass.renderCamera = this.renderPass.camera = this.camera
		}

		this.renderer.clear();
		this.composer.render(performance.now() * 0.001)
	}

	animateWithCamera(bounds,projectionMatrix,viewMatrix,modelMatrix) {
		if(!this.scene || !this.camera || !this.xr) return
		this.camera.matrix.fromArray(viewMatrix)
		this.camera.matrixWorldNeedsUpdate = true
		this.camera.updateMatrixWorld()
		this.camera.matrixWorld.decompose(this.camera.position,this.camera.quaternion,new THREE.Vector3())
		this.camera.projectionMatrix.fromArray(projectionMatrix)
		this.animate()
	}

	addAnchor(info) {
		// convenience function
		if(this.xr) {
			this.xr.addAnchor(info)
		}
	}
}

