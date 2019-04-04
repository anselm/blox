export class BehaviorLine extends THREE.Line2 {

	constructor(props,blob) {
		let geometry = new THREE.LineGeometry()
		let matLine = new THREE.LineMaterial( {
			color: 0xffffff,
			linewidth: 5, // in pixels
			vertexColors: THREE.VertexColors,
			dashed: false
		} );
		matLine.resolution.set( window.innerWidth, window.innerHeight )
		super(geometry,matLine)
		this.myGeometry = geometry
		this.first = blob.parent.children.find(props.first)
		this.second = blob.parent.children.find(props.second)
	}

	tick(interval,blob) {

		if(!this.first || !this.second) return

		let a = this.first.mesh.position
		let b = this.second.mesh.position

		let geometry = this.myGeometry
		let positions = [];
		let colors = [];
		//let points = hilbert3D( new THREE.Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
		let points = [ a, b ]
		let spline = new THREE.CatmullRomCurve3( points );
		let divisions = Math.round( 12 * points.length );
		let color = new THREE.Color();
		for ( let i = 0, l = divisions; i < l; i ++ ) {
			let point = spline.getPoint( i / l );
			positions.push( point.x, point.y, point.z );
			color.setHSL( i / l, 1.0, 0.5 );
			colors.push( color.r, color.g, color.b );
		}
		geometry.setPositions( positions );
		geometry.setColors( colors );

		this.computeLineDistances()
		geometry.verticesNeedUpdate = true;
	}

}

export class BehaviorBounce {
	constructor(props) {
		this.thrust = props.thrust ? new THREE.Vector3(props.thrust.x,props.thrust.y,props.thrust.z) : new THREE.Vector3()
		this.force = props.force ? new THREE.Vector3(props.force.x,props.force.y,props.force.z) : new THREE.Vector3()
		// TODO it does expect properties to exist... maybe it should force requirements to exist if not present
		// TODO so maybe it should also add itself to the blob? can it add duplicate named entries?
		// blob.register(this)
	}
	tick(interval,blob) {
		if(!blob.mesh) return
		this.force.add(this.thrust)
		blob.mesh.position.add(this.force)
		if(blob.mesh.position.y < 2) {
			blob.mesh.position.y = 2
			this.force.y = 0.5
		}
	}
}

export class BehaviorOscillate {
	constructor() {
		this.angle = 0
	}
	tick(interval,blob) {
		if(!blob.mesh) return // TODO more error checking
		let rad = 30
		this.angle += 0.01
		blob.mesh.position.set(Math.sin(this.angle)*rad, 3, Math.cos(this.angle)*rad)
	}
}

export class BehaviorWander {
	constructor(props) {
		this.thrust = props.thrust ? new THREE.Vector3(props.thrust.x,props.thrust.y,props.thrust.z) : new THREE.Vector3()
		this.force = props.force ? new THREE.Vector3(props.force.x,props.force.y,props.force.z) : new THREE.Vector3()
	}
	tick(interval,blob) {
		if(!blob.mesh) return
		// pick somewhere occasionally
		if(!this.focus || Math.random() < 0.011) {
			this.focus = new THREE.Vector3(Math.random()*20-10,Math.random()*20,Math.random()*20-10)
		}
		// accelerate towards it if far away
		this.thrust.x = ( this.focus.x - blob.mesh.position.x ) * 0.01 * interval
		this.thrust.y = ( this.focus.y - blob.mesh.position.y ) * 0.01 * interval
		this.thrust.z = ( this.focus.z - blob.mesh.position.z ) * 0.01 * interval
		this.force.add(this.thrust)
		this.mesh.position.add(this.force)
	}
}

export class BehaviorStare {
	constructor(props) {
		this.props = props
	}
	tick(interval,blob) {
		let focus = blob.parent.children.find(this.props)
		if(focus && focus.mesh) {
			blob.mesh.lookAt(focus.mesh.position)
		}
	}
}

