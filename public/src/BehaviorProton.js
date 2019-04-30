
export class BehaviorProton {

    constructor(args) {
        let props = args.description
        let blox = args.blox
		this.props = props
		this.particles = []
		this.rateCount = 0
		this.parentMesh = blox._findByProperty("isObject3D")
		let scene = blox.parent.scene // hack
		if(!scene) console.error("no scene")
		this.parentMesh.material.visible = false
		this.initProton(this.parentMesh,scene)
	}
	on_tick(args) {
        this.proton.update();
	}

    initProton(mesh,scene) {
        let proton = this.proton = new Proton();
        let emitter1 = this.emitter1 = this.createEmitter({
            p: {
                x: -100,
                y: 0
            },
            Body: this.createMesh("sphere")
        })
        let emitter2 = this.emitter2 = this.createEmitter({
            p: {
                x: 100,
                y: 0
            },
            Body: this.createMesh("cube")
        })
        proton.addEmitter(emitter1)
        proton.addEmitter(emitter2)
        proton.addRender(new Proton.MeshRender(scene))
        Proton.Debug.drawEmitter(proton, scene, emitter1)
        Proton.Debug.drawEmitter(proton, scene, emitter2)
    }

    createMesh(geo) {
        if (geo == "sphere") {
            var geometry = new THREE.SphereGeometry(10, 8, 8);
            var material = new THREE.MeshLambertMaterial({
                color: "#ff0000"
            });
        } else {
            var geometry = new THREE.BoxGeometry(20, 20, 20);
            var material = new THREE.MeshLambertMaterial({
                color: "#00ffcc"
            });
        }
        var mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

	createEmitter(obj) {
        var emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.1, .25));
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(10));
        emitter.addInitialize(new Proton.Life(2, 4));
        emitter.addInitialize(new Proton.Body(obj.Body));
        emitter.addInitialize(new Proton.Position(new Proton.BoxZone(100)));
        emitter.addInitialize(new Proton.Velocity(200, new Proton.Vector3D(0, 1, 1), 30));
        emitter.addBehaviour(new Proton.Rotate("random", "random"));
        emitter.addBehaviour(new Proton.Scale(1, 0.1));
        //Gravity
        emitter.addBehaviour(new Proton.Gravity(3));
        emitter.p.x = obj.p.x;
        emitter.p.y = obj.p.y;
        emitter.emit();
        return emitter;
    }

}

/*
snow


    function addProton() {
        proton = new Proton();
        emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(34, 48), new Proton.Span(.2, .5));
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(new Proton.Span(10, 20)));
        var position = new Proton.Position();
        position.addZone(new Proton.BoxZone(2500, 10, 2500));
        emitter.addInitialize(position);
        emitter.addInitialize(new Proton.Life(5, 10));
        emitter.addInitialize(new Proton.Body(createSnow()));
        emitter.addInitialize(new Proton.Velocity(0, new Proton.Vector3D(0, -1, 0), 90));
        emitter.addBehaviour(new Proton.RandomDrift(10, 1, 10, .05));
        emitter.addBehaviour(new Proton.Rotate("random", "random"));
        emitter.addBehaviour(new Proton.Gravity(2));
        var sceenZone = new Proton.ScreenZone(camera, renderer, 20, "234");
        emitter.addBehaviour(new Proton.CrossZone(sceenZone, "dead"));
        emitter.p.x = 0;
        emitter.p.y = 800;
        emitter.emit();
        proton.addEmitter(emitter);
        proton.addRender(new Proton.SpriteRender(scene));
        //Proton.Debug.drawZone(proton,scene,new Proton.BoxZone(800, 10, 800));
    }
    function createSnow() {
        var map = new THREE.TextureLoader().load("./img/snow.png");
        var material = new THREE.SpriteMaterial({
            map: map,
            transparent: true,
            opacity: .5,
            color: 0xffffff
        });
        return new THREE.Sprite(material);
    }

    */

    /*

     function addProton() {
        proton = new Proton();
        proton.addEmitter(createEmitter());
        proton.addRender(new Proton.SpriteRender(scene));
    }
    function createSprite() {
        var map = new THREE.TextureLoader().load("./img/dot.png");
        var material = new THREE.SpriteMaterial({
            map: map,
            color: 0xff0000,
            blending: THREE.AdditiveBlending,
            fog: true
        });
        return new THREE.Sprite(material);
    }
    function createEmitter() {
        emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(10, 15), new Proton.Span(.05, .1));
        emitter.addInitialize(new Proton.Body(createSprite()));
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Life(1, 3));
        emitter.addInitialize(new Proton.Position(new Proton.SphereZone(20)));
        emitter.addInitialize(new Proton.V(new Proton.Span(500, 800), new Proton.Vector3D(0, 1, 0), 30));
        emitter.addBehaviour(new Proton.RandomDrift(10, 10, 10, .05));
        //emitter.addBehaviour(new Proton.Alpha(1, 0.1));
        emitter.addBehaviour(new Proton.Scale(new Proton.Span(2, 3.5), 0));
        emitter.addBehaviour(new Proton.G(6));
        emitter.addBehaviour(new Proton.Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));
        emitter.p.x = 0;
        emitter.p.y = -150;
        emitter.emit();
        return emitter;
    }


*/
