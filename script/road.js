import { lerp } from './utils';

export default class Road {
  constructor(x, width, laneCount = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = x - width / 2;
    this.right = x + width / 2;

    const infinity = 1000000;
    this.top = -infinity;
    this.bottom = infinity;
  }

  getLaneCenter(index) {
    const laneWidth = this.width / this.laneCount;
    return this.left + laneWidth / 2 + index * laneWidth;
  }

  draw(context) {
    context.lineWidth = 5;
    context.strokeStyle = 'white';

    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount);

      context.setLineDash([20, 20]);
      context.beginPath();
      context.moveTo(x, this.top);
      context.lineTo(x, this.bottom);
      context.stroke();
    }
  }
}
