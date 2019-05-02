export class BehaviorAnchor {
	constructor(args) {
		this.blox = args.blox
		this.mesh = args.blox.mesh
		this.anchor = args.description
		this.anchor.addEventListener("update", this.handleAnchorUpdate.bind(this))
		this.anchor.addEventListener("removed", this.handleAnchorDelete.bind(this))		
	}
	on_tick() {
		this.mesh.matrixAutoUpdate = false
		this.mesh.matrix.fromArray(this.anchor.modelMatrix)
		this.mesh.updateMatrixWorld(true)
	}
	handleAnchorDelete() {
		this.anchor = 0;
		console.warn("Anchor deleted")
	}
	handleAnchorUpdate() {
		console.warn("Anchor moved")
	}
}