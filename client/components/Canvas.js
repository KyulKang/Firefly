import React, { useRef, useEffect } from 'react';
import Firefly from '../../script/firefly';
import { NeuralNetwork } from '../../script/network';
import Pellet from '../../script/pellet';

const Canvas = (props) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    document.addEventListener('keypress', function (event) {
      if (event.key === ' ') {
        save();
      }
      if (event.key === '-') {
        discard();
      }
    });

    const addFireflies = (num) => {
      const fireflies = [];

      for (let i = 0; i < num; i++) {
        fireflies.push(new Firefly(i, 300, 300, 25, 25, 'AI'));
      }

      return fireflies;
    };

    const addPellets = (num) => {
      const pellets = [];

      for (let i = 0; i < num; i++) {
        const positionX = Math.round(500 * (Math.random() * 2 - 1));
        const positionY = Math.round(500 * (Math.random() * 2 - 1));

        let pellet;

        if (i % 10 === 0) {
          pellet = new Pellet(positionX, positionY, 'LARGE');
        } else if (i % 3 === 0) {
          pellet = new Pellet(positionX, positionY, 'MEDIUM');
        } else {
          pellet = new Pellet(positionX, positionY, 'SMALL');
        }

        pellets.push(pellet);
      }

      return pellets;
    };

    const fireflies = addFireflies(20);
    const pellets = addPellets(50);

    let apexFly = fireflies[0];

    if (localStorage.getItem('bestBrain')) {
      for (let i = 0; i < fireflies.length; i++) {
        fireflies[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
        if (i !== 0) {
          NeuralNetwork.mutate(fireflies[i].brain, 0.2);
        }
      }
    }

    const save = () => {
      localStorage.setItem('bestBrain', JSON.stringify(apexFly.brain));
      console.log('Neural network saved.');
    };

    const discard = () => {
      localStorage.removeItem('bestBrain');
      console.log('Neural network discarded.');
    };

    const animate = () => {
      // Update items on the canvas
      for (let i = 0; i < pellets.length; i++) {
        pellets[i].update();
      }

      for (let i = 0; i < fireflies.length; i++) {
        fireflies[i].update(pellets);
      }

      apexFly = fireflies.find(
        (firefly) => firefly.life === Math.max(...fireflies.map((f) => f.life))
      );

      // Declare canvas area on each frame to ensure proper transition
      canvas.width = props.width;
      canvas.height = props.height;

      // Fix focused item to center of the canvas
      context.save();
      context.translate(
        -apexFly.x + canvas.width / 2,
        -apexFly.y + canvas.height / 2
      );

      // Draws items
      for (let i = 0; i < fireflies.length; i++) {
        fireflies[i].draw(context);
      }

      apexFly.draw(context, true);

      for (let i = 0; i < pellets.length; i++) {
        pellets[i].draw(context);
      }

      context.restore();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas id="my-canvas" ref={canvasRef} {...props} />;
};

export default Canvas;
