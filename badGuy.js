function BadGuy(x, y) {
    this.position = createVector(x, y);

    this.update = function() {

    }

    this.display = function() {
        fill("red");
        ellipse(this.position.x, this.position.y, 8, 8);
    }
} 