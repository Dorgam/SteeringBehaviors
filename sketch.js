var vehicles = [];
var badGuy = null;

var seekSlider;
var cohesionSlider;
var separationSlider;
var alignmentSlider;
var wanderSlider;

function setup() {
  // Creating a canvas
  var canvas = createCanvas(640, 480);
  canvas.parent('canvas');

  seekSlider = createSlider(0, 20, 10, 0.1).parent('seek');
  cohesionSlider = createSlider(0, 20, 5, 0.1).parent('cohesion');
  separationSlider = createSlider(0, 20, 15, 0.1).parent('separation');
  alignmentSlider = createSlider(0, 20, 10, 0.1).parent('alignment');
  wanderSlider = createSlider(0, 20, 5, 0.1).parent('wander');
  fleeSlider = createSlider(0, 20, 5, 0.1).parent('flee');

  
  // Creating vehicles
  for (var i = 0; i < 75; i++) {
      vehicles.push(new Vehicle(random(width), random(height)));
  }
}

function draw() {
  background(51);
  var target = createVector(mouseX, mouseY);
  for (var i = 0; i < vehicles.length; i++) {
      vehicles[i].seek(target, seekSlider.value());
      vehicles[i].wander(wanderSlider.value());
      vehicles[i].separate(vehicles, 100, separationSlider.value());
      vehicles[i].cohesion(vehicles, 100, cohesionSlider.value());
      vehicles[i].align(vehicles, 100, alignmentSlider.value());

      if(badGuy != null) {
        vehicles[i].flee(badGuy, fleeSlider.value());
      }

      vehicles[i].update();
      vehicles[i].display();
  }
  
  if(badGuy != null) {
      badGuy.update();
      badGuy.display();
  }
}

function mouseClicked() {
  badGuy = new BadGuy(mouseX, mouseY);
}