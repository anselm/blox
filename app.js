
// Make a blob that will be the root of the scene - a json graph can be passed to the constructor

let world = new Blob()

// or, here is another way to load some stuff into it - loading a specified javascript file with some json in it

world._load_module('./app_scene.js')


