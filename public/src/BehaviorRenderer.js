
import {XRInputManager} from '../lib/XRInputManager.js'

export class XRSupport {

	static supportsARKit() {
		if(typeof window.webkit === 'undefined' || !navigator.xr) {
			return false
		}
		console.log("*** webxr will be used ***")
		return true
	}

	getContext(canvas=0) {
		this.canvas = canvas
		this.context = 0
		let prom = new Promise((resolve, reject) => {
			navigator.xr.requestDevice().then((xrDevice)=>{
				this.device = xrDevice
				if(!this.canvas) this.canvas = document.createElement('canvas')
				if(!this.context) this.context = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })
				this.xrCanvas = document.createElement('canvas')
				this.xrContext = this.xrCanvas.getContext('xrpresent')
				//document.body.insertBefore(this.xrCanvas, document.body.firstChild)
				this.device.requestSession({
						outputContext: this.xrContext,
						worldSensing: true,
						//computerVision: true,
						geolocation: true,
						alignEUS: true,
					}
				).then((xrSession)=>{
					this.session = xrSession
					this.session.baseLayer = new XRWebGLLayer(this.session, this.context)
					resolve(this.context)
				}).catch(err => {
					console.error('Session setup error', err)
					reject()
				})
			}).catch(err => {
				console.error('Error', err)
				reject()
			})
		})
		return prom
	}

	setAnimationLoop(userAnimationCallback) {
		this.userAnimationCallback = userAnimationCallback
		this.headFrameOfReference = 0
		this.eyeLevelFrameOfReference = 0

		// head-model is the coordinate system that tracks the position of the display
		this.session.requestFrameOfReference('head-model').then(frameOfReference =>{
			this.headFrameOfReference = frameOfReference
		}).catch(err => {
			console.error('Error finding head frame of reference', err)
		})

		// get eye level which is somehow different from head level?
		this.session.requestFrameOfReference('eye-level').then(frameOfReference => {
			this.eyeLevelFrameOfReference = frameOfReference
		}).catch(err => {
			console.error('Error finding eye frame of reference', err)
		})

		//this.inputManager = new XRInputManager(this.handleXRInput.bind(this))
		this._handleAnimationFrame = this._handleAnimationFrame.bind(this)

		this.session.requestAnimationFrame(this._handleAnimationFrame)
	}

	_handleAnimationFrame(time,frame){

		if(!this.session || this.session.ended) return
		if(!this.eyeLevelFrameOfReference || !this.headFrameOfReference) return

		let pose = frame.getDevicePose(this.eyeLevelFrameOfReference)
		if(!pose){
			console.log('No pose')
			return
		}

		this._resolvePendingAnchors(frame)

		for (let view of frame.views) {
			this.userAnimationCallback(
				this.session.baseLayer.getViewport(view),
				view.projectionMatrix,
				pose.getViewMatrix(view)
			)
			break
		}

		this.session.requestAnimationFrame(this._handleAnimationFrame)
	}

	///////////////////////////////////////////////////////////////////////////////
	// anchors
	///////////////////////////////////////////////////////////////////////////////

	addAnchor(info) {
		// store them till engine is ready for them
		if(!this.pendingAnchors) {
			this.pendingAnchors = []
		}
		if(!this._anchoredNodes) {
			this._anchoredNodes = new Map() // { XRAnchorOffset, Three.js Object3D }			
		}
		this.pendingAnchors.push(info)
	}

	_resolvePendingAnchors(frame) {
		while(this.pendingAnchors && this.pendingAnchors.length) {
			let info = this.pendingAnchors.shift()
			if(info.art) {
				this.addImageAnchoredNode(info)
			} else if(info.hasOwnProperty("cartographic")) {
				this.addGeoAnchoredNode(info)
			} else if(info.anchor) {
				this.addAnchoredNode(info)
			}
		}
	}

	addImageAnchoredNode(info) {

		console.log("adding an image recognizer")

		if(!info.art || !info.node) {
			console.error("Missing image or threejs node")
			return
		}

		var img = new Image()
		img.onload = (x) => {
			info.image = img
			this.addImageAnchoredNode2(info)
		}
		img.src = info.art
	}

	addImageAnchoredNode2(info) {

		let image = info.image
		let imageRealworldWidth = info.imageRealworldWidth || 0.1
		let node = info.node

		let canvas = document.createElement('canvas')
		let context = canvas.getContext('2d')
		canvas.width = image.width
		canvas.height = image.height
		context.drawImage(image,0,0)
		image.data = context.getImageData(0,0,image.width,image.height)

		// TODO examine
		// random name from https://gist.github.com/6174/6062387
		image.name = [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('')

		// Attach image observer handler
		this.session.nonStandard_createDetectionImage(image.name, image.data.data, image.width, image.height, 0.2).then(() => {
			this.session.nonStandard_activateDetectionImage(image.name).then(anchor => {
				// this gets invoked after the image is seen for the first time
				node.anchorName = image.name
				this.addAnchoredNode({anchor:anchor,node:node})
			}).catch(error => {
				console.error("error activating detection image: " + error)
			})
		}).catch(error => {
			console.error("error creating detection image: " + error)
		})
	}

	addGeoAnchoredNode(info) {

		console.log("adding a geo recognizer")

		if(!info.node || !info.cartographic) {
			console.error("Missing threejs node or cartographic details")
			return
		}

		let node = info.node

		// Preferentially use a supplied place if any

		if(info.cartographic.hasOwnProperty("latitude") && info.cartographic.hasOwnProperty("longitude")) {
			// use supplied altitude?

			if(info.cartographic.hasOwnProperty("altitude") && info.cartographic.altitude) {
				let lla = new Cesium.Cartographic(info.cartographic.longitude*Math.PI/180, info.cartographic.latitude*Math.PI/180, info.cartographic.altitude )
				console.log("adding geo anchor with explicit properties")
				console.log(lla)
				console.log(lla.latitude * 180 / Math.PI)
				console.log(lla.longitude * 180 / Math.PI)
				XRGeospatialAnchor.createGeoAnchor(lla).then(anchor => {
						this.addAnchoredNode({anchor:anchor,node:node})
				})
			} else {
				XRGeospatialAnchor.getDeviceElevation().then(altitude => {
					let lla = new Cesium.Cartographic(info.cartographic.longitude*Math.PI/180, info.cartographic.latitude*Math.PI/180, altitude )
					console.log("found device elevation: ", altitude)
					console.log(lla)
					console.log(lla.latitude * 180 / Math.PI)
					console.log(lla.longitude * 180 / Math.PI)
					XRGeospatialAnchor.createGeoAnchor(lla).then(anchor => {
						this.addAnchoredNode({anchor:anchor,node:node})
					})
				})
			}
		}

		// else find current position

		else {
			XRGeospatialAnchor.getDeviceCartographic().then(cartographic => {
				XRGeospatialAnchor.getDeviceElevation().then(altitude => {
					console.log(cartographic)
					let lla = new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, altitude )
					console.log("found everything and using altitude " + altitude)
					console.log(lla)
					console.log(lla.latitude * 180 / Math.PI)
					console.log(lla.longitude * 180 / Math.PI)
					XRGeospatialAnchor.createGeoAnchor(lla).then(anchor => {
						this.addAnchoredNode({anchor:anchor,node:node})
					})
				})
			})
		}
	}

	addAnchoredNode(info){
		let anchor = info.anchor
		let node = info.node
		if (!anchor || !anchor.uid) {
			console.error("not a valid anchor", anchor)
			return;
		}
		this._anchoredNodes.set(anchor.uid, { anchor: anchor, node: node })
		node.matrixAutoUpdate = false
		node.matrix.fromArray(anchor.modelMatrix)
		node.updateMatrixWorld(true)
		// TODO this may fail on nested objects - should compute pose relative to parent
		node.matrixWorld.decompose(node.position,node.quaternion,node.scale)
		anchor.addEventListener("update", this._handleAnchorUpdate.bind(this))
		anchor.addEventListener("removed", this._handleAnchorDelete.bind(this))
	}

	_handleAnchorDelete(details) {
		let anchor = details.source
		const anchoredNode = this._anchoredNodes.get(anchor.uid)
		if (anchoredNode) {
			anchoredNode.node.matrixAutoUpdate = true
			// NOTIFY SOMEBODY? TODO
			this._anchoredNodes.delete(anchor.uid)
		}
	}

	_handleAnchorUpdate(details) {
		const anchor = details.source
		const anchoredNode = this._anchoredNodes.get(anchor.uid)
		if (anchoredNode) {
			const node = anchoredNode.node
			node.matrix.fromArray(anchor.modelMatrix)
			node.updateMatrixWorld(true)
			// TODO this may fail on nested objects - should compute pose relative to parent
			node.matrixWorld.decompose(node.position,node.quaternion,node.scale)
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// xr input
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	handleXRInput(eventName, details){
		if(!this.session || !this.headFrameOfReference || !this.projectionMatrix) {
			return
		}
		if(eventName != 'normalized-touch') {
			console.error('unknown xr input event', eventName, details)
			return
		}
		let x = details.normalizedCoordinates.normalizedX
		let y = details.normalizedCoordinates.normalizedY
		// Convert the screen coordinates into head-model origin/direction for hit testing
		const [origin, direction] = XRInputManager.convertScreenCoordinatesToRay(x,y,this.projectionMatrix)
		this.session.requestHitTest(origin, direction, this.headFrameOfReference)
			.then(this.handleHitResults.bind(this))
			.catch(err => {
				console.error('Error testing hits', err)
			})
	}

	handleHitResults(hits) {

		// TEST - TODO move to user land because no access to blox from here

		let size = 0.05;
		let hit = hits[0]

		this.session.addAnchor(hit, this.headFrameOfReference).then(myanchor => {

			let description = {
				mesh:"./art/hornet",
				anchor: {
					anchor: myanchor
				}
			}
			let fresh = this.blox.children.push(description)

		}).catch(err => {
			console.error('Error adding anchor', err)
		})
	}

}

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

		this.composer = new THREE.EffectComposer( this.renderer )
		this.composer.setSize( width, height ) // TODO this may not be needed?

		this.renderPass = new THREE.RenderPass( this.scene, this.camera )
		this.composer.addPass( this.renderPass )

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
		this.outlinePass.renderScene = this.renderPass.scene = this.scene
		this.outlinePass.renderCamera = this.renderPass.camera = this.camera
		this.composer.render()
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
		if(this.xr) {
			this.xr.addAnchor(info)
		}
	}
}

