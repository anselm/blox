export class BehaviorAnchor {
	constructor(args) {
		this.blox = args.blox
	}
	on_tick() {
		// - go get an anchor if none
		if(!this.anchorFetched) {
			this.anchorFetched = 1
			this.anchor = this.blox.parent.renderer.xr.getAnchor()
			this.mesh.matrixAutoUpdate = false
			this.anchor.addEventListener("update", this._handleAnchorUpdate.bind(this))
			this.anchor.addEventListener("removed", this._handleAnchorDelete.bind(this))		
		}
		if(!this.anchor) return
		mesh.matrix.fromArray(anchor.modelMatrix)
		mesh.updateMatrixWorld(true)	
	}
	_handleAnchorDelete() {
		this.anchor = 0;
		console.warn("Anchor deleted")
	}
	_handleAnchorUpdate() {
		console.warn("Anchor moved")
	}
}