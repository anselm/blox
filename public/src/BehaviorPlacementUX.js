
import {XRInputManager} from '../lib/XRInputManager.js'

export class BehaviorPlacementUX {
	constructor() {
		const inputManager = new XRInputManager(this.handleXRInput.bind(this))
	}

	handleXRInput(eventName, details){
		switch(eventName){
			case 'normalized-touch':
				this.hitTestWithScreenCoordinates(...details.normalizedCoordinates)
					.then(this.handleHitResults.bind(this))
					.catch(err => {
						console.error('Error testing hits', err)
					})
				break
			default:
				console.error('unknown xr input event', eventName, details)
				break
		}
	}
		
	handleHitResults(hits) {
		let size = 0.05;
		let hit = hits[0]
		let session = this.blox.parent.renderer.xr.session
		let headFrameOfReference = this.blox.parent.renderer.xr.headFrameOfReference
		session.addAnchor(hit, headFrameOfReference).then(anchor => {

			let description = {
				name:"test",
				mesh:"./art/hornet",
				anchor:anchor
			}
			let fresh = this.blox.parent.group.push(description)

		}).catch(err => {
			console.error('Error adding anchor', err)
		})
	}



	hitTestWithScreenCoordinates(normalizedX, normalizedY){
		let session = this.blox.parent.renderer.xr.session
		let headFrameOfReference = this.blox.parent.renderer.xr.headFrameOfReference
		let projectionMatrix = this.blox.parent.renderer.camera.projectionMatrix
		if(session === null){
			console.log('No session for hit testing')
			return Promise.reject()
		}
		if(headFrameOfReference === null){
			console.log('No frame of reference')
			return Promise.reject()
		}
		// Convert the screen coordinates into head-model origin/direction for hit testing
		const [origin, direction] = XRInputManager.convertScreenCoordinatesToRay(normalizedX, normalizedY,projectionMatrix)

		return session.requestHitTest(origin, direction, headFrameOfReference)
	}


}

/*

export class BehaviorPlacementUX extends HTMLElement {

	content() {
	return `
		<style>
		.uxbutton {
		border-radius: 2px;
		background: transparent;
		border-style: solid;
		border-color: #aaeeaa;
		margin: 2px;
		padding: 2px;
		width: 64px;
		}
		.uxbutton img {
		width: 60px;
		filter: invert(0) hue-rotate(90deg) drop-shadow(16px 16px 10px rgba(0,0,0,0.9));
		}
		</style>
		<button style="position:absolute;right:10;top:40" class=uxbutton><img alt="editor" src="../art/flatsplatterred.png" ></img></button>
		<button style="position:absolute;right:10;top:110" class=uxbutton><img alt="maps" src="../art/flatglobered.png"   ></img></button>
		<button style="position:absolute;right:10;top:200" class=uxbutton><img alt="profile" src="../art/flatheadred.png" ></img></button>
		<button style="position:absolute;right:10;top:280" class=uxbutton><img alt="zones" src="../art/flatshellred.png"  ></img></button>
		`
	}

	constructor(args) {
		super()
		this.innerHTML = this.content()
		this.blox = args.blox

		// observe button events
		let callback = (e) => {
			e.preventDefault()
			console.log("got event")
		    //this.dispatchEvent( new CustomEvent('router_push', { bubbles: true, detail: e.target.alt }) )
			//window.history.push(e.target.alt)
			return 0
		}
	    this.querySelectorAll("button").forEach(element => { element.onclick = this.makething.bind(this) })

	    // observe hide / show and tell the augmented view to update or not
		//new MutationObserver(() => {
		//	view.please_update = this.style.display == "block"
		//}).observe(this,{attributes:true})

		// TODO I can't decide if this should add itself or if some kind of router should add it
		document.body.appendChild(this)
	}

	makething() {
		let description = {
			name:"test",
			art:"./art/hornet",
			anchor:0
		}
		let fresh = this.blox.parent.group.push(description)
	}
}

customElements.define('behavior-placementux', BehaviorPlacementUX)

*/

