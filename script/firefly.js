import Controls from './controls';
import { NeuralNetwork } from './network';
import Sensor from './sensor';
import { polysIntersect } from './utils';

export default class Firefly {
  constructor(index, x, y, width, height, controlType = 'DUMMY') {
    this.index = index + 1;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.maxSpeed = controlType === 'DUMMY' ? 5 : 8;
    this.coefficient = 0.96;
    this.acceleration = 0.3;
    this.angle = 0;
    this.life = 30;
    this.timeElapsed = 0;
    this.done = false;

    this.useBrain = controlType === 'AI';

    if (controlType !== 'DUMMY') {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }

    this.controls = new Controls(controlType);

    this.img = new Image();
    this.img.src = 'firefly.png';

    setInterval(() => {
      this.life--;
      this.timeElapsed++;
    }, 500);
  }

  update(pellets) {
    if (!this.done) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.life += this.#consumePellet(pellets);

      if (this.sensor) {
        this.sensor.update(pellets);

        const offsets = this.sensor.readings.map((s) =>
          s === null ? 0 : 1 - s.offset
        );

        const outputs = NeuralNetwork.feedForward(offsets, this.brain);

        if (this.useBrain) {
          this.controls.forward = outputs[0];
          this.controls.left = outputs[1];
          this.controls.right = outputs[2];
          this.controls.reverse = outputs[3];
        }
      }
    }
    if (this.life <= 0 && !this.done) {
      this.done = true;
      console.log(
        `#${this.index} survived ` + this.timeElapsed / 2 + ' seconds.'
      );
    }
  }

  #move() {
    const flip = this.speed < 0 && !this.controls.forward ? -1 : 1;

    if (this.controls.forward) {
      this.speed += this.acceleration;
    }

    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (Math.abs(this.speed) < 0.05) {
      this.speed = 0;
    } else {
      this.speed *= this.coefficient;
    }

    if (this.controls.left) {
      this.angle += 0.09 * flip;
    }

    if (this.controls.right) {
      this.angle -= 0.09 * flip;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width * 0.7, this.height * 0.7) / 2;
    const alpha = Math.atan2(this.width * 0.7, this.height * 0.7);

    points.push({
      x: this.x - Math.sin(this.angle - alpha + Math.PI / 4) * rad,
      y: this.y - Math.cos(this.angle - alpha + Math.PI / 4) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha + Math.PI / 4) * rad,
      y: this.y - Math.cos(this.angle + alpha + Math.PI / 4) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle - alpha + Math.PI + Math.PI / 4) * rad,
      y: this.y - Math.cos(this.angle - alpha + Math.PI + Math.PI / 4) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha + Math.PI + Math.PI / 4) * rad,
      y: this.y - Math.cos(this.angle + alpha + Math.PI + Math.PI / 4) * rad,
    });

    return points;
  }

  #consumePellet(pellets) {
    for (let i = 0; i < pellets.length; i++) {
      if (polysIntersect(this.polygon, pellets[i].polygon)) {
        if (pellets[i].point) {
          pellets[i].move();
          return pellets[i].point;
        }
      }
    }

    return 0;
  }

  draw(context, showSensors = false) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);

    if (this.life > 0) {
      context.drawImage(
        this.img,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      context.globalAlpha = 0.2;
      context.drawImage(
        this.img,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    context.restore();

    if (this.sensor && showSensors) {
      this.sensor.draw(context);
    }
  }
}
