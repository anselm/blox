
export class BehaviorAnchor {
	constructor(args) {
		this.blox = args.blox
		this.mesh = args.blox.mesh

		if(args.description.raw) {
console.error("disabled")
	return
			// raw anchor from internal mechanism
			this.anchor = args.description.raw
			this.anchor.addEventListener("update", this.handleAnchorUpdate.bind(this))
			this.anchor.addEventListener("removed", this.handleAnchorDelete.bind(this))
		}

		else if(args.description.art) {
			// anchor form art
			this.setup_image_test(args)
		}

		// anchor will move obj
		this.mesh.matrixAutoUpdate = false
	}
	on_tick() {
		if(!this.anchor) return true
		this.mesh.matrix.fromArray(this.anchor.modelMatrix)
		this.mesh.matrixWorldNeedsUpdate = true
		this.mesh.updateMatrixWorld(true)
		return true
	}


	handleAnchorDelete() {
		this.anchor = 0;
		console.warn("Anchor deleted")
	}
	handleAnchorUpdate() {
		console.warn("Anchor moved")
	}



	getImageData(imageID) {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let img = document.getElementById(imageID);
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0 );
        return context.getImageData(0, 0, img.width, img.height);
	}

	setup_image_nothing() {
        if (imageAnchor) {
            session.removeAnchor(imageAnchor)
            imageAnchor = null
        }
    }

	setup_image_test() {

		let session = this.blox.parent.renderer.xr.session

		if(!session) {
			// try again soon
			console.log("anchor not ready yet")
			setTimeout( this.setup_image_test.bind(this),1000);
			return
		}

		this.session = session

this.part2()
return

		let resetButton = document.createElement('button')
		resetButton.innerText = 'Reset'
		document.body.appendChild(resetButton)
		resetButton.addEventListener('click',this.part2.bind(this))

	}

	part2() {
		let session = this.session

		let name = 'hubs'
		let image = this.getImageData('hubs-image')
		console.log(image)
		session.nonStandard_createDetectionImage(name, image.data, image.width, image.height, 0.2).then(() => {
			session.nonStandard_activateDetectionImage(name).then(anchor => {
				this.anchor = anchor
				this.anchor.addEventListener("remove", this.handleAnchorDelete.bind(this))
				this.anchor.addEventListener("update", this.handleAnchorUpdate.bind(this))
				this.anchor.addEventListener("removed", this.handleAnchorDelete.bind(this))
			}).catch(error => {
				console.error(`error activating detection image: ${error}`)
			})
		}).catch(error => {
			console.error(`error creating detection image: ${error}`)
		})

    }



}