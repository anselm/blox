			// test idea - watch for proximity events on self, and broadcast
			// this could be a brute force observer for now, later a broadphase system
			// on criteria being met (gazed at, proximity collision, even a mouse pick - it would fire)
			//		i think i will have a mini grammar, events are always going to use that grammar
			//			"thingname.behaviorname.methodname arguments"
			//		this lets me send messages to the world as "* arguments" -> which goes to a special listener
			//		and to an object "buzz.mesh.activate 1" -> make the buzz object mesh visible
			//		and to self "self.effect.activate 1" -> start own effect behavior
			//		and to custom behaviors "self.mybehavior.dosomething args"
			//
			// i may as well allow code too - i could even allow eval i guess...
//			proximity: {
//				radius:10,
//				event: function(event) { event.blob.effect.activate(1) } // { event.blob, event.other, event.args }
//			}
