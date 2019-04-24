export class BehaviorLine extends THREE.Line2 {

	constructor(args) {
		let props = args.description
		let blox = args.blox
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
		this.first = blox.query(props.first)
		this.second = blox.query(props.second)
	}

	on_tick(args) {

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
	constructor(args) {
		let props = args.description
		let blox = args.blox
		this.thrust = props.thrust ? new THREE.Vector3(props.thrust.x,props.thrust.y,props.thrust.z) : new THREE.Vector3()
		this.force = props.force ? new THREE.Vector3(props.force.x,props.force.y,props.force.z) : new THREE.Vector3()
		// TODO it does expect properties to exist... maybe it should force requirements to exist if not present
		// TODO so maybe it should also add itself to the blox? can it add duplicate named entries?
		// blox.register(this)
	}
	on_tick(args) {
		if(!args.blox.mesh) return
		this.force.add(this.thrust)
		args.blox.mesh.position.add(this.force)
		if(args.blox.mesh.position.y < 2) {
			args.blox.mesh.position.y = 2
			this.force.y = 0.5
		}
	}
}

export class BehaviorOscillate {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		this.angle = 0
	}
	on_tick(args) {
		if(!args.blox.mesh) return // TODO more error checking
		let rad = 30
		this.angle += 0.01
		args.blox.mesh.position.set(Math.sin(this.angle)*rad, 3, Math.cos(this.angle)*rad)
	}
}

export class BehaviorWander {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		this.thrust = props.thrust ? new THREE.Vector3(props.thrust.x,props.thrust.y,props.thrust.z) : new THREE.Vector3()
		this.force = props.force ? new THREE.Vector3(props.force.x,props.force.y,props.force.z) : new THREE.Vector3()
	}
	on_tick(args) {
		if(!args.blox.mesh) return
		// pick somewhere occasionally
		if(!this.focus || Math.random() < 0.011) {
			this.focus = new THREE.Vector3(Math.random()*20-10,Math.random()*20,Math.random()*20-10)
		}
		// accelerate towards it if far away
		this.thrust.x = ( this.focus.x - blox.mesh.position.x ) * 0.01 * interval
		this.thrust.y = ( this.focus.y - blox.mesh.position.y ) * 0.01 * interval
		this.thrust.z = ( this.focus.z - blox.mesh.position.z ) * 0.01 * interval
		this.force.add(this.thrust)
		args.mesh.position.add(this.force) // TODO update to use a newer force philosophy or consolidate
	}
}

export class BehaviorStare {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		this.props = props
		this.focus = blox.query(props)
	}
	on_tick(args) {
		if(this.focus && this.focus.mesh && args.blox.mesh) {
			args.blox.mesh.lookAt(this.focus.mesh.position)
		}
	}
}

