var S = {
  init: function () {
      var action = window.location.href,
          i = action.indexOf('?a=');

      S.Drawing.init('.canvas2');
      document.body.classList.add('body--ready');

      if (i !== -1) {
          S.UI.simulate(decodeURI(action).substring(i + 3));
      } else {
          S.UI.simulate('|#countdown 3||我爱你|你是我的唯一|💖|#circle|');
      }

      S.Drawing.loop(function () {
          S.Shape.render();
      });
  }
};

S.Drawing = (function () {
  var canvas,
      context,
      renderFn,
      requestFrame = window.requestAnimationFrame ||
                     window.webkitRequestAnimationFrame ||
                     window.mozRequestAnimationFrame ||
                     window.oRequestAnimationFrame ||
                     window.msRequestAnimationFrame ||
                     function(callback) { window.setTimeout(callback, 1000 / 60); };

  return {
      init: function (el) {
          canvas = document.querySelector(el);
          context = canvas.getContext('2d',{ willReadFrequently: true });
          this.adjustCanvas();

          window.addEventListener('resize', function () {
              S.Drawing.adjustCanvas();
          });
      },

      loop: function (fn) {
          renderFn = !renderFn ? fn : renderFn;
          this.clearFrame();
          renderFn();
          requestFrame.call(window, this.loop.bind(this));
      },

      adjustCanvas: function () {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      },

      clearFrame: function () {
          context.clearRect(0, 0, canvas.width, canvas.height);
      },

      drawCircle: function (p, c) {
          context.fillStyle = c.render();
          context.beginPath();
          context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
          context.closePath();
          context.fill();
      }
  };
}());

S.UI = (function () {
  var sequence = [];
  var interval;
  function performAction(value) {
      sequence = typeof(value) === 'object' ? value : sequence.concat(value.split('|'));
      
      function timedAction(fn, delay, max, reverse) {
          clearInterval(interval);
          var currentAction = reverse ? max : 1;
          fn(currentAction);
          if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
              interval = setInterval(function () {
                  currentAction = reverse ? currentAction - 1 : currentAction + 1;
                  fn(currentAction);
                  if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
                      clearInterval(interval);
                  }
              }, delay);
          }
      }

      timedAction(function (index) {
          var current = sequence.shift();
          switch (current) {
              case '#countdown':
                  timedAction(function (i) {
                      if (i === 0) {
                          performAction(sequence);
                      } else {
                          S.Shape.switchShape(S.ShapeBuilder.letter(i));
                      }
                  }, 1000, 3, true);
                  break;
              case '#circle':
                  S.Shape.switchShape(S.ShapeBuilder.circle(10));
                  break;
              default:
                  S.Shape.switchShape(S.ShapeBuilder.letter(current));
          }
      }, 2000, sequence.length);
  }

  return {
      simulate: function (action) {
          performAction(action);
      }
  };
}());

S.Point = function (args) {
  this.x = args.x;
  this.y = args.y;
  this.z = args.z;
  this.a = args.a;
  this.h = args.h;
};

S.Color = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};
S.Color.prototype.render = function () {
  return `rgba(${this.r},${this.g},${this.b},${this.a})`;
};

S.ShapeBuilder = (function () {
  var shapeCanvas = document.createElement('canvas'),
      shapeContext = shapeCanvas.getContext('2d'),
      fontSize = 500,
      fontFamily = 'Arial, sans-serif';

  function fit() {
      shapeCanvas.width = window.innerWidth;
      shapeCanvas.height = window.innerHeight;
      shapeContext.textBaseline = 'middle';
      shapeContext.textAlign = 'center';
  }

  function processCanvas() {
      var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data,
          dots = [],
          x = 0,
          y = 0;

      for (var p = 0; p < pixels.length; p += 4) {
          if (pixels[p + 3] > 0) {
              dots.push(new S.Point({ x: x, y: y }));
          }
          x++;
          if (x >= shapeCanvas.width) {
              x = 0;
              y++;
          }
      }
      return { dots: dots };
  }

  function setFontSize(s) {
      shapeContext.font = `bold ${s}px ${fontFamily}`;
  }

  fit();
  window.addEventListener('resize', fit);

  return {
      letter: function (l) {
          setFontSize(fontSize);
          shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
          shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);
          return processCanvas();
      },
      circle: function (d) {
          shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
          shapeContext.beginPath();
          shapeContext.arc(shapeCanvas.width / 2, shapeCanvas.height / 2, d * 10, 0, 2 * Math.PI, false);
          shapeContext.fill();
          return processCanvas();
      }
  };
}());

S.Shape = (function () {
  var dots = [];

  return {
      switchShape: function (n) {
          dots = n.dots;
      },
      render: function () {
          for (var d = 0; d < dots.length; d++) {
              S.Drawing.drawCircle(dots[d], new S.Color(255, 0, 0, 1));
          }
      }
  };
}());

S.init();
