export default class Pellet {
  constructor(x, y, type = 'SMALL') {
    this.x = x;
    this.y = y;
    this.point = 3;
    this.size = 4;

    switch (type) {
      case 'MEDIUM':
        this.point = 5;
        this.size = 6;
        break;
      case 'LARGE':
        this.point = 10;
        this.size = 9;
        break;
      default:
        break;
    }
  }

  update() {
    this.polygon = this.#createPolygon();
  }

  move() {
    const moveX = 300 * Math.random() * 2 - 1;
    const moveY = 300 * Math.random() * 2 - 1;

    this.x += moveX;
    this.y += moveY;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.size, this.size) / 1.6;
    const alpha = Math.atan2(this.size, this.size);

    points.push({
      x: this.x - Math.sin(-alpha) * rad,
      y: this.y - Math.cos(-alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(alpha) * rad,
      y: this.y - Math.cos(alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(-alpha + Math.PI) * rad,
      y: this.y - Math.cos(-alpha + Math.PI) * rad,
    });
    points.push({
      x: this.x - Math.sin(alpha + Math.PI) * rad,
      y: this.y - Math.cos(alpha + Math.PI) * rad,
    });

    return points;
  }

  draw(context) {
    context.beginPath();

    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(0, 180, 200, 0.6)';
    context.shadowBlur = 25;
    context.shadowColor = 'rgb(0, 200, 230)';
    context.fill();
  }
}
