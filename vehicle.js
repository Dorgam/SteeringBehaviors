// Particle Class Definition
function Vehicle(x, y, mass = 1, bounciness = 0, color = createVector(random(255), random(255), random(255))) {
    // Physics Properties
    this.maxSpeed = 3;
    this.maxForce = 0.05;
    this.mass = mass;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.bounciness = map(bounciness, 0, 1, 0.5, 1, true); // A value between 0 and 1 that determines how "bouncy" a ball is.
                                                  // 0 => Full stop on hit (Energy Lost), 1 => Full bounce on hit (Energy is conserved)

    // Steering Forces
    this.separateForce = createVector(0, 0);
    this.seekForce = createVector(0, 0);
    this.arriveForce = createVector(0, 0);
    this.alignForce = createVector(0, 0);
    this.cohesionForce = createVector(0, 0);
    this.wanderForce = createVector(0, 0);
    this.fleeForce = createVector(0, 0);

    // Steering Weights
    this.separateWeight = 0;
    this.seekWeight = 0;
    this.arriveWeight = 0;
    this.alignWeight = 0;
    this.cohesionWeight = 0;
    this.wanderWeight = 0;
    this.fleeWeight = 0;
    
    // Aesthetic Properties
    this.color = color; // Using a vector to store three related values
    this.size = mass * 6;

    this.stepX = random() * 1;
    this.stepY = random() * 10;
    this.stepZ = random() * 100;

    this.applyForce = function (force) {
        // Newton's Second Law: Force = Mass * Acceleration
        // => Acceleration = Force / Mass
        // Since this function adds forces we are going to increment acceleration instead of setting it.
        this.acceleration.add(p5.Vector.div(force, this.mass));
    }

    this.seek = function(target, weight = 1) {
        this.seekWeight = weight;
        var desired = this.getDesired(target);

        // Seek Logic: Go at maximum speed towards the target
        desired.setMag(this.maxSpeed);

        this.seekForce = desired;
        this.steer();
    }

    this.flee = function (target, weight = 1) {
        this.fleeWeight = weight;
        var desired = this.getDesired(target.position).mult(-1);

        // Seek Logic: Go at maximum speed towards the target
        desired.setMag(this.maxSpeed);

        this.fleeForce = desired;
        this.steer();
    }

    this.wander = function (weight = 1) {
        this.wanderWeight = weight;
        var target = p5.Vector.add(this.velocity, createVector(noise(this.stepX), noise(this.stepY)));
        var desired = this.getDesired(target);

        // Seek Logic: Go at maximum speed towards the target
        desired.setMag(this.maxSpeed);

        this.wanderForce = desired;
        this.steer();
    }


    this.arrive = function(target, range = 100, weight = 1) {
        this.arriveWeight = weight;
        var desired = this.getDesired(target);

        // Arrive Logic: arrive slowly at target
        if(desired.mag() < range) {
            desired.setMag(map(desired.mag(), 0, 100, 0, this.maxSpeed));
        } else {
            // Seek!
            desired.setMag(this.maxSpeed);
        }

        this.arriveForce = desired;
        this.steer();
    }

    this.separate = function (vehicles, separation = this.size * 2, weight = 1) {
        this.separateWeight = weight;
        var inRangeVehiclesCount = 0;
        var totalForce = createVector(0, 0);

         // Loop on all vehicles
        for (var i = 0; i < vehicles.length; i++) {
            var distanceToVehicle = p5.Vector.dist(this.position, vehicles[i].position); // distance to other vehicle
            if (distanceToVehicle > 0 && distanceToVehicle < separation) { // apply separation to vehicles that are within "separation" range
                var awayForce = p5.Vector.sub(this.position, vehicles[i].position); // Force away from the vehicle
                awayForce.setMag(1.0 / distanceToVehicle); // Magnitude of the force should be in proportion to the distance, closer vehicles affect more than far vehicles
                totalForce.add(awayForce);
                inRangeVehiclesCount++;
            }
        }

        // Now, we have the total force direction, but we need to scale down the magnitude and limit it to the maxSpeed
        if(inRangeVehiclesCount > 0) {
            totalForce.setMag(this.maxSpeed/inRangeVehiclesCount); // Calculate the total force magnitude
        } 

        this.separateForce = totalForce;
        this.steer();
    }

    this.align = function (vehicles, alignRadius = this.size * 2, weight = 1) {
        this.alignWeight = weight;
        var inRangeVehiclesCount = 0;
        var totalForce = createVector(0, 0);

        // Loop on all vehicles
        for (var i = 0; i < vehicles.length; i++) {
            var distanceToVehicle = p5.Vector.dist(this.position, vehicles[i].position); // distance to other vehicle
            if (distanceToVehicle > 0 && distanceToVehicle < alignRadius) { // apply separation to vehicles that are within "separation" range
                totalForce.add(vehicles[i].velocity);
                inRangeVehiclesCount++;
            }
        }

        // Now, we have the total force direction, but we need to scale down the magnitude and limit it to the maxSpeed
        if (inRangeVehiclesCount > 0) {
            totalForce.setMag(this.maxSpeed / inRangeVehiclesCount); // Calculate the total force magnitude
        }

        this.alignForce = totalForce;
        this.steer();
    }

    this.cohesion = function (vehicles, cohesionRadius = this.size * 2, weight = 1) {
        this.cohesionWeight = weight;
        var inRangeVehiclesCount = 0;
        var totalForce = createVector(0, 0);

        // Loop on all vehicles
        for (var i = 0; i < vehicles.length; i++) {
            var distanceToVehicle = p5.Vector.dist(this.position, vehicles[i].position); // distance to other vehicle
            if (distanceToVehicle > 0 && distanceToVehicle < cohesionRadius) { // apply separation to vehicles that are within "separation" range
                totalForce.add(vehicles[i].position);
                inRangeVehiclesCount++;
            }
        }

        // Now, we have the total force direction, but we need to scale down the magnitude and limit it to the maxSpeed
        if (inRangeVehiclesCount > 0) {
            totalForce.setMag(this.maxSpeed / inRangeVehiclesCount); // Calculate the total force magnitude
        }

        this.cohesionForce = totalForce;
        this.steer();
    }

    this.steer = function() {
        // Calculate the desired force out of all the steering behaviors
        var desired = createVector(0, 0);
        desired.add(this.separateForce.mult(this.separateWeight));
        desired.add(this.seekForce.mult(this.seekWeight));
        desired.add(this.arriveForce.mult(this.arriveWeight));
        desired.add(this.alignForce.mult(this.alignWeight));
        desired.add(this.cohesionForce.mult(this.cohesionWeight));
        desired.add(this.wanderForce.mult(this.wanderWeight));
        desired.add(this.fleeForce.mult(this.fleeWeight));

        var steering = p5.Vector.sub(desired, this.velocity);
        steering.limit(this.maxForce);
        this.applyForce(steering);
    }

    this.getDesired = function(target) {
        // "desired" is a vector from the current position to the target position
        return p5.Vector.sub(target, this.position);
    }

    this.update = function () {
        // Update Perlin Steps
        this.updatePerlinSteps();
        // Make sure you are not passing scene walls
        this.checkWalls();
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit max velocity
        this.velocity.limit(this.maxSpeed); 
        // Update position 
        this.position.add(this.velocity);
        // Reset acceleration to recalculate it.
        this.acceleration.setMag(0);
    }

    this.updatePerlinSteps = function() {
        this.stepX += 0.01;
        this.stepY += 0.01;
        this.stepZ += 0.01;
    }

    // Drawing the particle
    this.display = function () {
        // Draw a triangle rotated in the direction of velocity
        var theta = this.velocity.heading() + PI / 2;
        fill(noise(this.stepX) * 255, noise(this.stepY) * 255, noise(this.stepZ) * 255);
        stroke(200);
        strokeWeight(1);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.size * 2);
        vertex(-this.size, this.size * 2);
        vertex(this.size, this.size * 2);
        endShape(CLOSE);
        pop();
    }

    this.checkWalls = function () {
        if (this.position.y + (this.mass * 8) > height) { // Check bottom wall
            this.position.y = height - (this.mass * 8);   // Simulates collision (Prevents from going overboard)
            this.applyForce(this.getBounceForce());         // Add Bounce force
        } else if(this.position.y - (this.mass * 8) < 0) { // Check top wall
            this.position.y = this.mass * 8;
            this.applyForce(this.getBounceForce());
        } else if(this.position.x + (this.mass * 8) > width) { // Check  right wall
            this.position.x = width - (this.mass * 8);
            this.applyForce(this.getBounceForce());
        } else if(this.position.x - (this.mass * 8) < 0) {  // Check left wall
            this.position.x = this.mass * 8;
            this.applyForce(this.getBounceForce());
        }
    }

    // Bounce force is calculated by inverting the current velocity in the opposite
    // direction and modifying it by how "bouncy" the ball is
    this.getBounceForce = function() {
        var bounceForce = p5.Vector.mult(this.velocity, -2 * this.bounciness);
        return bounceForce;
    }
}