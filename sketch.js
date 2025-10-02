// Variables para controlar los parámetros del árbol
let branchLength = 120;
let angle = 25;
let reduction = 0.7;
let maxDepth = 8;
let colorMode = 'natural';

// Variables para los pájaros
let birds = [];
let enableBirds = true;
let birdDensity = 0.3; // Probabilidad de que aparezca un pájaro en una hoja

// Clase para los pájaros
class Bird {
  constructor(x, y, colorScheme) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2, 2), random(-3, -1));
    this.acc = createVector(0, 0);
    this.size = random(4, 8);
    this.lifespan = 255;
    this.colorScheme = colorScheme;
    this.wingAngle = 0;
    this.wingSpeed = random(0.2, 0.4);
    this.rotation = random(-PI/6, PI/6);
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  update() {
    // Aplicar una fuerza aleatoria para simular el vuelo
    let wind = createVector(random(-0.05, 0.05), random(-0.05, 0));
    this.applyForce(wind);
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 1.5;
    
    // Actualizar el ángulo de las alas para animación
    this.wingAngle = sin(frameCount * this.wingSpeed) * PI/4;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation + atan2(this.vel.y, this.vel.x));
    
    // Color del pájaro según el esquema de color del árbol
    this.setColor();
    
    // Dibujar el cuerpo
    noStroke();
    ellipse(0, 0, this.size * 2, this.size);
    
    // Dibujar la cabeza
    ellipse(this.size, 0, this.size * 0.8, this.size * 0.8);
    
    // Dibujar las alas
    push();
    rotate(this.wingAngle);
    ellipse(0, -this.size, this.size * 1.5, this.size * 0.5);
    pop();
    
    push();
    rotate(-this.wingAngle);
    ellipse(0, this.size, this.size * 1.5, this.size * 0.5);
    pop();
    
    // Dibujar la cola
    triangle(-this.size, 0, -this.size * 2, -this.size/2, -this.size * 2, this.size/2);
    
    pop();
  }
  
  setColor() {
    switch (this.colorScheme) {
      case 'natural':
        fill(50, 50, 50, this.lifespan);
        break;
      case 'rainbow':
        fill(random(255), random(255), random(255), this.lifespan);
        break;
      case 'autumn':
        let autumnColors = [
          color(153, 76, 0, this.lifespan),
          color(204, 102, 0, this.lifespan),
          color(204, 0, 0, this.lifespan),
          color(101, 67, 33, this.lifespan)
        ];
        fill(random(autumnColors));
        break;
      case 'winter':
        fill(200, 200, 220, this.lifespan);
        break;
    }
  }
  
  isDead() {
    return this.lifespan <= 0 || this.pos.y < -100 || this.pos.x < -100 || this.pos.x > width + 100;
  }
}

function setup() {
  createCanvas(800, 600);
  
  // Configurar los controles de la interfaz
  document.getElementById('branchLengthSlider').addEventListener('input', function() {
    branchLength = parseInt(this.value);
    document.getElementById('branchLengthValue').textContent = branchLength;
    resetBirds();
    redraw();
  });
  
  document.getElementById('angleSlider').addEventListener('input', function() {
    angle = parseInt(this.value);
    document.getElementById('angleValue').textContent = angle;
    resetBirds();
    redraw();
  });
  
  document.getElementById('reductionSlider').addEventListener('input', function() {
    reduction = parseInt(this.value) / 100;
    document.getElementById('reductionValue').textContent = reduction.toFixed(2);
    resetBirds();
    redraw();
  });
  
  document.getElementById('depthSlider').addEventListener('input', function() {
    maxDepth = parseInt(this.value);
    document.getElementById('depthValue').textContent = maxDepth;
    resetBirds();
    redraw();
  });
  
  document.getElementById('colorSelector').addEventListener('change', function() {
    colorMode = this.value;
    resetBirds();
    redraw();
  });
  
  // Añadir control para habilitar/deshabilitar pájaros
  document.getElementById('birdsCheckbox').addEventListener('change', function() {
    enableBirds = this.checked;
    if (enableBirds) {
      loop(); // Iniciar la animación si los pájaros están habilitados
    } else {
      noLoop(); // Detener la animación si los pájaros están deshabilitados
      resetBirds();
      redraw();
    }
  });
  
  // Añadir control para la densidad de pájaros
  document.getElementById('birdDensitySlider').addEventListener('input', function() {
    birdDensity = parseInt(this.value) / 100;
    document.getElementById('birdDensityValue').textContent = birdDensity.toFixed(2);
    resetBirds();
    redraw();
  });
  
  // Iniciar en modo de animación si los pájaros están habilitados
  if (enableBirds) {
    loop();
  } else {
    noLoop();
  }
}

function draw() {
  background(240);
  
  // Actualizar y mostrar los pájaros
  if (enableBirds) {
    // Filtrar los pájaros muertos
    birds = birds.filter(bird => !bird.isDead());
    
    // Actualizar y mostrar cada pájaro
    for (let bird of birds) {
      bird.update();
      bird.display();
    }
  }
  
  // Guardar el estado actual para dibujar el árbol
  push();
  
  // Dibujar el árbol desde la parte inferior central del canvas
  translate(width / 2, height);
  
  // Comenzar a dibujar el árbol
  branch(branchLength, 0);
  
  // Restaurar el estado
  pop();
}

// Función recursiva para dibujar las ramas del árbol
function branch(len, depth) {
  // Determinar el grosor de la rama basado en su longitud
  let thickness = map(len, 10, branchLength, 1, 10);
  strokeWeight(thickness);
  
  // Determinar el color basado en el modo seleccionado y la profundidad
  setColor(depth, len);
  
  // Dibujar la rama
  line(0, 0, 0, -len);
  
  // Mover al final de la rama
  translate(0, -len);
  
  // Detener la recursión si hemos alcanzado la profundidad máxima o la rama es muy pequeña
  if (depth < maxDepth && len > 4) {
    // Guardar el estado actual
    push();
    
    // Rotar a la derecha y dibujar una nueva rama
    rotate(radians(angle));
    branch(len * reduction, depth + 1);
    
    // Restaurar el estado
    pop();
    
    // Guardar el estado actual
    push();
    
    // Rotar a la izquierda y dibujar una nueva rama
    rotate(radians(-angle));
    branch(len * reduction, depth + 1);
    
    // Restaurar el estado
    pop();
    
    // Añadir una tercera rama en el medio para algunos árboles (opcional)
    if (random() < 0.3 && depth < 3) {
      push();
      rotate(radians(random(-10, 10)));
      branch(len * reduction * 0.8, depth + 1);
      pop();
    }
  } else if (depth >= maxDepth - 2) {
    // Dibujar hojas en las ramas finales
    drawLeaves(depth);
  }
}

// Función para establecer el color según el modo y la profundidad
function setColor(depth, len) {
  switch (colorMode) {
    case 'natural':
      // Colores naturales: marrón para el tronco, verde para las ramas
      if (depth < 2) {
        stroke(101, 67, 33); // Marrón oscuro para el tronco
      } else if (depth < maxDepth - 2) {
        // Gradiente de marrón a verde para las ramas
        let greenAmount = map(depth, 2, maxDepth - 2, 0, 1);
        stroke(
          lerp(101, 34, greenAmount),
          lerp(67, 139, greenAmount),
          lerp(33, 34, greenAmount)
        );
      } else {
        stroke(34, 139, 34); // Verde para las ramas finales
      }
      break;
      
    case 'rainbow':
      // Colores del arcoíris basados en la profundidad
      let hue = map(depth, 0, maxDepth, 0, 360);
      stroke(color(`hsl(${hue}, 100%, 50%)`));
      break;
      
    case 'autumn':
      // Colores de otoño: marrón, naranja, rojo, amarillo
      if (depth < 2) {
        stroke(101, 67, 33); // Marrón para el tronco
      } else {
        let autumnColors = [
          color(153, 76, 0),    // Marrón
          color(204, 102, 0),   // Naranja oscuro
          color(255, 128, 0),   // Naranja
          color(204, 0, 0),     // Rojo
          color(255, 204, 0)    // Amarillo
        ];
        let index = floor(map(depth + random(-0.5, 0.5), 0, maxDepth, 0, autumnColors.length - 1));
        index = constrain(index, 0, autumnColors.length - 1);
        stroke(autumnColors[index]);
      }
      break;
      
    case 'winter':
      // Colores de invierno: azules y blancos
      if (depth < 2) {
        stroke(50, 50, 80); // Azul oscuro para el tronco
      } else {
        let winterAmount = map(depth, 2, maxDepth, 0, 1);
        stroke(
          lerp(50, 220, winterAmount),
          lerp(50, 220, winterAmount),
          lerp(80, 255, winterAmount)
        );
      }
      break;
  }
}

// Función para dibujar hojas en las ramas finales
function drawLeaves(depth) {
  noStroke();
  
  // Determinar el color de las hojas según el modo
  let leafColor;
  switch (colorMode) {
    case 'natural':
      leafColor = color(34, 139, 34, 150); // Verde semi-transparente
      fill(leafColor);
      break;
    case 'rainbow':
      let hue = map(depth + random(-10, 10), 0, maxDepth, 0, 360);
      leafColor = color(`hsla(${hue}, 100%, 50%, 0.6)`);
      fill(leafColor);
      break;
    case 'autumn':
      let autumnLeafColors = [
        color(204, 102, 0, 150),   // Naranja
        color(153, 76, 0, 150),    // Marrón
        color(204, 0, 0, 150),     // Rojo
        color(255, 204, 0, 150)    // Amarillo
      ];
      leafColor = random(autumnLeafColors);
      fill(leafColor);
      break;
    case 'winter':
      leafColor = color(220, 220, 255, 150); // Azul claro semi-transparente
      fill(leafColor);
      break;
  }
  
  // Dibujar varias hojas pequeñas
  for (let i = 0; i < 5; i++) {
    let size = random(3, 8);
    let xPos = random(-10, 10);
    let yPos = random(-10, 10);
    ellipse(xPos, yPos, size, size);
    
    // Crear pájaros con cierta probabilidad si están habilitados
    if (enableBirds && random() < birdDensity) {
      // Obtener la posición global del pájaro
      let globalPos = getGlobalPosition(xPos, yPos);
      
      // Crear un nuevo pájaro en esta posición
      birds.push(new Bird(globalPos.x, globalPos.y, colorMode));
    }
  }
}

// Función para obtener la posición global a partir de la posición relativa
function getGlobalPosition(relX, relY) {
  // Crear un vector con la posición relativa
  let pos = createVector(relX, relY);
  
  // Aplicar la transformación actual para obtener la posición global
  return screenPosition(pos);
}

// Función para convertir una posición relativa a global considerando las transformaciones
function screenPosition(pos) {
  // Crear una copia del vector
  let newPos = createVector(pos.x, pos.y);
  
  // Aplicar la matriz de transformación actual
  let matrix = drawingContext.getTransform();
  let x = newPos.x * matrix.a + newPos.y * matrix.c + matrix.e;
  let y = newPos.x * matrix.b + newPos.y * matrix.d + matrix.f;
  
  return createVector(x, y);
}

// Función para reiniciar los pájaros
function resetBirds() {
  birds = [];
}

// Función para reiniciar el dibujo cuando se cambia la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

// Permitir que el usuario haga clic para redibujar con variaciones aleatorias
function mousePressed() {
  // Añadir un poco de aleatoriedad a los parámetros
  angle = constrain(angle + random(-5, 5), 10, 45);
  document.getElementById('angleSlider').value = angle;
  document.getElementById('angleValue').textContent = angle;
  
  redraw();
}