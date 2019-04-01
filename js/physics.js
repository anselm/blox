///
/// A physics capability
/// TODO right now this is treated as just another object in a scene....
/// I feel like it should get some special precedence or be implicitly added if not present?
///

let globalDynamics = 0
let bigworld = 0
let allbodies = 0

class BehaviorPhysics {

	constructor(props,blob) {

		Ammo()

		this.collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration()
		this.dispatcher              = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
		this.overlappingPairCache    = new Ammo.btDbvtBroadphase()
		this.solver                  = new Ammo.btSequentialImpulseConstraintSolver()
		this.dynamicsWorld           = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration)

		this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))

		this.bodies = []

bigworld = this.dynamicsWorld // TODO HACK
allbodies = this.bodies

		globalDynamics = this.add.bind(this)
	}

	add(body) {
		this.dynamicsWorld.addRigidBody(body)
		this.bodies.push(body)
	}

	tick() {
		this.dynamicsWorld.stepSimulation(1/60, 10)
	}

	destroy() {
	    Ammo.destroy(this.dynamicsWorld)
	    Ammo.destroy(this.solver)
	    Ammo.destroy(this.overlappingPairCache)
	    Ammo.destroy(this.dispatcher)
	    Ammo.destroy(this.collisionConfiguration)
	}
}

/*


https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_terrain/index.html


				switch ( objectType ) {
					case 1:
						// Sphere
						var radius = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.SphereGeometry( radius, 20, 20 ), createObjectMaterial() );
						shape = new Ammo.btSphereShape( radius );
						shape.setMargin( margin );
						break;
					case 2:
						// Box
						var sx = 1 + Math.random() * objectSize;
						var sy = 1 + Math.random() * objectSize;
						var sz = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), createObjectMaterial() );
						shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
						shape.setMargin( margin );
						break;
					case 3:
						// Cylinder
						var radius = 1 + Math.random() * objectSize;
						var height = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, height, 20, 1 ), createObjectMaterial() );
						shape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height * 0.5, radius ) );
						shape.setMargin( margin );
						break;
					default:
						// Cone
						var radius = 1 + Math.random() * objectSize;
						var height = 2 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( 0, radius, height, 20, 2 ), createObjectMaterial() );
						shape = new Ammo.btConeShape( radius, height );
						break;
				}

*/

///
/// For now I just combine physics and meshes, might be better to leave them distinct
/// TODO it could search the parent for a mesh, and or let a region be specified...
///


class BehaviorPhysical {
	constructor(props,blob) {

		this.props = props

		// Force properties to exist
		let scale = blob.mesh.scale
		let position = blob.mesh.position
		let size = scale.length()

		let mass = this.mass = props.mass || 0
		let transform = this.transform = 0


		let shape = "unknown"
		if(blob.mesh.geometry instanceof THREE.BoxBufferGeometry) shape = "box"
		if(blob.mesh.geometry instanceof THREE.SphereGeometry) shape = "sphere"

		switch(shape) {
			case "sphere":
				shape = this.shape = new Ammo.btSphereShape(size/2)
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
			default:
				shape = this.shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x/2,scale.y/2,scale.z/2))
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
		}

		let localInertia  = new Ammo.btVector3(0, 0, 0)
		if(mass) shape.calculateLocalInertia(mass, localInertia)
		let myMotionState = new Ammo.btDefaultMotionState(transform)
		let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia)

		this.body = new Ammo.btRigidBody(rbInfo)
		this.trans = new Ammo.btTransform()

		// super bouncy for now
		this.body.setRestitution(0.9)

		// disable deactivation for now
		this.body.setActivationState(4)
		this.body.activate()

		if(this.props.launch) {
			this.body.applyCentralForce(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
		}

		globalDynamics(this.body) // TODO hack

if(!props.joint) return;
let test1 = allbodies[allbodies.length-2]
let test2 = allbodies[allbodies.length-1]

			let transforma = new Ammo.btTransform()
			transforma.setIdentity()
			//transforma.setOrigin(new Ammo.btVector3(0, 10, 0))

			let transformb = new Ammo.btTransform()
			transformb.setIdentity()
			//transformb.setOrigin(new Ammo.btVector3(0, 0, 0))

			let constraint = new Ammo.btSliderConstraint(
				test1,
				test2,
				transforma,
				transformb,
				true
			)

			constraint.setLowerLinLimit(0)
			constraint.setUpperLinLimit(2)

			// don't need to do this
			//	constraint.setLowerAngLimit(-1)
			//	constraint.setUpperAngLimit(-1)

			// motors are not supported
			//	constraint.setLinMotorVelocity( 1 )
			//	constraint.setMaxLinMotorForce( 0.0001 );
			//	constraint.setPoweredLinMotor( true );

			// try see if a persistent force will make it stay at limit


			//	constraint.setSoftnessLimLin( params.linear || 0 )
			//	constraint.setSoftnessLimAng( params.angular || 0 )

		bigworld.addConstraint( constraint );

	}

	tick(interval,blob) {

		if(this.props.force) {
//			this.body.applyCentralForce(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
		}


		if(!blob.mesh) return
		let ms = this.body.getMotionState()
		if (ms) {
			ms.getWorldTransform(this.trans)
			var p = this.trans.getOrigin()
			var q = this.trans.getRotation()
			blob.mesh.position.set( p.x(), p.y(), p.z() )
			blob.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() )
		}
	}
}


