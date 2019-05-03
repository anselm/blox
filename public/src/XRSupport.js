
export class XRSupport {

	static supportsARKit() {
		if(typeof window.webkit === 'undefined' || !navigator.xr) return false
		return true
	}

	getContext(canvas=0) {
		this.device = 0
		this.session = 0
		this.xrCanvas = 0
		this.xrContext = 0
		this.canvas = canvas
		this.context = 0
		this.xrCanvas = document.createElement('canvas')
		this.xrContext = this.xrCanvas.getContext('xrpresent')
		let p = new Promise((resolve, reject) => {
			// document.body.insertBefore(this.xrCanvas, document.body.firstChild) <- not needed?
			navigator.xr.requestDevice().then((xrDevice)=>{
				this.device = xrDevice
				this.device.requestSession({ outputContext: this.xrContext }).then((xrSession)=>{
					this.session = xrSession
					if(!this.canvas) this.canvas = document.createElement('canvas')
					if(!this.context) this.context = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })
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
		return p
	}

	setAnimationLoop(userAnimationCallback) {
		this.userAnimationCallback = userAnimationCallback
		this.__handleAnimationFrame = this._handleAnimationFrame.bind(this)

		// head-model is the coordinate system that tracks the position of the display
		this.session.requestFrameOfReference('head-model').then(frameOfReference =>{
			this.headFrameOfReference = frameOfReference

			// get eye level which is somehow different from head level?
			this.session.requestFrameOfReference('eye-level').then(frameOfReference => {
				this.eyeLevelFrameOfReference = frameOfReference
				this.session.requestAnimationFrame(this.__handleAnimationFrame)
			}).catch(err => {
				console.error('Error finding eye frame of reference', err)
			})

		}).catch(err => {
			console.error('Error finding head frame of reference', err)
		})

	}

	_handleAnimationFrame(time=0, frame=0){

		if(!this.session || this.session.ended) return

		this.session.requestAnimationFrame(this.__handleAnimationFrame)

		let pose = frame.getDevicePose(this.eyeLevelFrameOfReference)
		if(!pose){
			console.log('No pose')
			return
		}

		for (let view of frame.views) {
			this.userAnimationCallback(
				this.session.baseLayer.getViewport(view),
				view.projectionMatrix,
				pose.getViewMatrix(view),
			)
			break
		}
	}

	getAnchor(xyz) {
		// returns a promise
		return this.session.addAnchor(xyz, this.headFrameOfReference)
	}

}

