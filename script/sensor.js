import { lerp, getIntersection } from './utils';

export default class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 9;
    this.rayLength = 250;
    this.raySpread = Math.PI;

    this.rays = [];
  }

  update(pellets) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], pellets));
    }
  }

  #getReading(ray, pellets) {
    let touches = [];
    for (let i = 0; i < pellets.length; i++) {
      const poly = pellets[i].polygon;
      for (let j = 0; j < poly.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );

        if (value) {
          touches.push(value);
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      return touches.find((e) => e.offset === Math.min(...offsets));
    }
  }

  #castRays() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) +
        this.car.angle;

      const start = {
        x: this.car.x,
        y: this.car.y,
      };

      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  draw(context) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];

      if (this.readings[i]) {
        end = this.readings[i];
      }

      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255, 255, 255, 0.3)';

      context.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      context.lineTo(end.x, end.y);

      context.stroke();

      // Draws the portion that is cut off from the collision

      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255, 0, 0, 0.5)';

      context.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      context.lineTo(end.x, end.y);

      context.stroke();
    }
  }
}
