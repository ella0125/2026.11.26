let bgImage;
let bgOffsetX = 0;

let characterSprite;
let walkSprite;
let magicSprite;
let magicEffectSprite;

let character2StopSprites = [];
let character2ActionSprites = [];

let characterX;
let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;

let activeEffects = [];

const frameCountInSprite = 10;
const frameWidth = 139.5;
const frameHeight = 196;

const walkFrameCount = 9;
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;

const magicFrameCount = 4;
const magicFrameWidth = 1039 / magicFrameCount;
const magicFrameHeight = 146;

const effectFrameCount = 5;
const effectFrameWidth = 740 / effectFrameCount;
const effectFrameHeight = 19;

const framesPerStep = 8;

let character2X = 0;
let character2IsActive = false;

let questionPanel;
let questionTitle;
let questionText;
let answerButtons = [];

let questionAnswered = false;
let answeredThisApproach = false;

let correctAnswer = 0;
let questionNumberA = 0;
let questionNumberB = 0;

let feedbackText = "";
let feedbackColor = "#ffffff";

let specialEffectType = "";
let specialEffectStartTime = 0;
const specialEffectDuration = 3000;

let fireworks = [];
let lightningBolts = [];

function preload() {
  bgImage = loadImage("bg/3.png");

  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png");

  for (let i = 0; i < 8; i++) {
    character2StopSprites.push(loadImage(`2/stop/${i}.png`));
  }

  for (let i = 0; i < 13; i++) {
    character2ActionSprites.push(loadImage(`2/action/${i}.png`));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);
  frameRate(60);

  characterX = (width * 2) / 3;

  createQuestionInterface();
  updateCharacter2Position();
}

function draw() {
  background("#87CEEB");

  const bgAspect =
    bgImage && bgImage.height > 0
      ? bgImage.width / bgImage.height
      : 1;

  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3;

  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight || movingLeft;

  const movementStep = constrain(width * 0.004, 2, 8);

  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale;
  const characterHeight = height / 3;

  if (movingRight) {
    facingDirection = 1;

    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep;
    }
  }

  if (movingLeft) {
    facingDirection = -1;

    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep;
    }
  }

  characterX = constrain(
    characterX,
    characterWidth / 2,
    width - characterWidth / 2
  );

  if (bgImage) {
    push();

    imageMode(CORNER);

    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;

      image(
        bgImage,
        drawX,
        0,
        singleBgWidth,
        singleBgHeight
      );
    }

    pop();
  }

  updateCharacter2Position();
  drawCharacter2();

  updateQuestionInterface();
  drawCharacter1();
  drawMagicEffects(characterScale);
  drawSpecialEffect();
}

function drawCharacter1() {
  const characterScale = (height / 3) / frameHeight;
  const characterHeight = height / 3;

  if (
    isCasting &&
    frameCount - magicStartFrame >= magicFrameCount * framesPerStep
  ) {
    isCasting = false;

    const characterWidth = frameWidth * characterScale;

    activeEffects.push({
      x: characterX + magicDirection * characterWidth / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    });
  }

  const activeSprite = isCasting
    ? magicSprite
    : isWalking
      ? walkSprite
      : characterSprite;

  const activeFrameCount = isCasting
    ? magicFrameCount
    : isWalking
      ? walkFrameCount
      : frameCountInSprite;

  const activeFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
      ? walkFrameWidth
      : frameWidth;

  const activeFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
      ? walkFrameHeight
      : frameHeight;

  const elapsedMagicFrames =
    frameCount - magicStartFrame;

  const frameIndex = isCasting
    ? min(
        magicFrameCount - 1,
        floor(elapsedMagicFrames / framesPerStep)
      )
    : floor(frameCount / framesPerStep) % activeFrameCount;

  const sourceX = frameIndex * activeFrameWidth;

  const activeWidth =
    activeFrameWidth * characterScale;

  const activeHeight =
    activeFrameHeight * characterScale;

  const characterY =
    height - activeHeight / 2;

  push();

  translate(characterX, characterY);

  scale(
    isCasting
      ? magicDirection
      : facingDirection,
    1
  );

  image(
    activeSprite,
    0,
    0,
    activeWidth,
    activeHeight,
    sourceX,
    0,
    activeFrameWidth,
    activeFrameHeight
  );

  pop();
}

function updateCharacter2Position() {
  const bgAspect =
    bgImage && bgImage.height > 0
      ? bgImage.width / bgImage.height
      : 1;

  const singleBgWidth =
    max(width, height * bgAspect);

  /*
    左側背景圖的水平中心位置。
  */
  character2X =
    bgOffsetX - singleBgWidth / 2;

  const approachDistance =
    max(160, width * 0.22);

  const wasActive =
    character2IsActive;

  character2IsActive =
    abs(characterX - character2X) <=
    approachDistance;

  if (!wasActive && character2IsActive) {
    if (!answeredThisApproach) {
      createNewQuestion();
    }
  }

  if (wasActive && !character2IsActive) {
    answeredThisApproach = false;
    questionAnswered = false;
    feedbackText = "";
    specialEffectType = "";
    hideQuestionInterface();
  }
}

function drawCharacter2() {
  if (
    character2StopSprites.length === 0 ||
    character2ActionSprites.length === 0
  ) {
    return;
  }

  const spriteList = character2IsActive
    ? character2ActionSprites
    : character2StopSprites;

  const currentFrame =
    floor(frameCount / framesPerStep) %
    spriteList.length;

  const sprite =
    spriteList[currentFrame];

  if (
    !sprite ||
    sprite.width <= 0 ||
    sprite.height <= 0
  ) {
    return;
  }

  const character2Height =
    height / 3;

  const character2Scale =
    character2Height / sprite.height;

  const character2Width =
    sprite.width * character2Scale;

  const character2Y =
    height - character2Height / 2;

  push();

  imageMode(CENTER);

  image(
    sprite,
    character2X,
    character2Y,
    character2Width,
    character2Height
  );

  pop();
}

function createQuestionInterface() {
  questionPanel = createDiv("");
  questionPanel.style("position", "fixed");
  questionPanel.style("box-sizing", "border-box");
  questionPanel.style("display", "none");
  questionPanel.style("z-index", "10");
  questionPanel.style("padding", "20px");
  questionPanel.style("border-radius", "16px");
  questionPanel.style("background", "rgba(255, 221, 0, 0.9)");
  questionPanel.style("border", "3px solid rgba(120, 80, 0, 0.8)");
  questionPanel.style("box-shadow", "0 8px 20px rgba(0,0,0,0.3)");
  questionPanel.style("text-align", "center");
  questionPanel.style("font-family", "Arial, sans-serif");
  questionPanel.style("color", "#3b2800");

  questionTitle = createDiv("數學加法挑戰");
  questionTitle.parent(questionPanel);
  questionTitle.style("font-size", "clamp(18px, 3vw, 30px)");
  questionTitle.style("font-weight", "bold");
  questionTitle.style("margin-bottom", "12px");

  questionText = createDiv("");
  questionText.parent(questionPanel);
  questionText.style("font-size", "clamp(22px, 4vw, 40px)");
  questionText.style("font-weight", "bold");
  questionText.style("margin-bottom", "18px");

  for (let i = 0; i < 4; i++) {
    const button = createButton("");
    button.parent(questionPanel);

    button.style("display", "block");
    button.style("width", "100%");
    button.style("min-height", "42px");
    button.style("margin", "8px 0");
    button.style("padding", "8px 12px");
    button.style("border", "2px solid #765500");
    button.style("border-radius", "10px");
    button.style("background", "#fff8c7");
    button.style("color", "#3b2800");
    button.style("font-size", "clamp(16px, 2.5vw, 24px)");
    button.style("font-weight", "bold");
    button.style("cursor", "pointer");

    button.mousePressed(() => {
      const selectedAnswer =
        Number(button.elt.dataset.answer);

      answerQuestion(selectedAnswer);
    });

    answerButtons.push(button);
  }

  feedbackText = "";
  updateQuestionPanelPosition();
}

function createNewQuestion() {
  questionNumberA =
    floor(random(1, 21));

  questionNumberB =
    floor(random(1, 21));

  correctAnswer =
    questionNumberA + questionNumberB;

  const answers = [
    correctAnswer
  ];

  while (answers.length < 4) {
    const wrongAnswer =
      max(
        0,
        correctAnswer +
          floor(random(-10, 11))
      );

    if (!answers.includes(wrongAnswer)) {
      answers.push(wrongAnswer);
    }
  }

  shuffleArray(answers);

  questionText.html(
    `${questionNumberA} ＋ ${questionNumberB} ＝ ？`
  );

  for (let i = 0; i < answerButtons.length; i++) {
    answerButtons[i].html(
      `${String.fromCharCode(65 + i)}. ${answers[i]}`
    );

    answerButtons[i].elt.dataset.answer =
      answers[i];

    answerButtons[i].style(
      "background",
      "#fff8c7"
    );

    answerButtons[i].style(
      "color",
      "#3b2800"
    );

    answerButtons[i].removeAttribute(
      "disabled"
    );
  }

  feedbackText = "";
  feedbackColor = "#ffffff";
  questionAnswered = false;
  answeredThisApproach = false;

  questionPanel.style("display", "block");
  updateQuestionPanelPosition();
}

function answerQuestion(selectedAnswer) {
  if (questionAnswered) {
    return;
  }

  questionAnswered = true;
  answeredThisApproach = true;

  for (const button of answerButtons) {
    button.attribute("disabled", "true");
  }

  if (selectedAnswer === correctAnswer) {
    feedbackText = "答對了！";

    feedbackColor = "#127a26";

    questionTitle.html("答對了！");
    questionText.html(
      `${questionNumberA} ＋ ${questionNumberB} ＝ ${correctAnswer}`
    );

    specialEffectType = "fireworks";
    specialEffectStartTime = millis();

    createFireworks();
  } else {
    feedbackText = "答錯了！";

    feedbackColor = "#a71919";

    questionTitle.html("答錯了！");
    questionText.html(
      `正確答案是 ${correctAnswer}`
    );

    specialEffectType = "lightning";
    specialEffectStartTime = millis();

    createLightningBolts();
  }

  for (const button of answerButtons) {
    button.style(
      "background",
      selectedAnswer === correctAnswer
        ? "#9df2a8"
        : "#ffb0b0"
    );
  }
}

function updateQuestionInterface() {
  if (!questionPanel) {
    return;
  }

  if (character2IsActive) {
    questionPanel.style("display", "block");
    updateQuestionPanelPosition();
  } else {
    hideQuestionInterface();
  }
}

function hideQuestionInterface() {
  if (questionPanel) {
    questionPanel.style("display", "none");
  }
}

function updateQuestionPanelPosition() {
  if (!questionPanel) {
    return;
  }

  const panelWidth =
    max(260, width / 3);

  const panelHeight =
    max(260, height / 2);

  const panelLeft =
    (width - panelWidth) / 2;

  const panelTop = 10;

  questionPanel.style(
    "left",
    `${panelLeft}px`
  );

  questionPanel.style(
    "top",
    `${panelTop}px`
  );

  questionPanel.style(
    "width",
    `${panelWidth}px`
  );

  questionPanel.style(
    "height",
    `${panelHeight}px`
  );

  questionPanel.style(
    "overflow-y",
    "auto"
  );
}

function shuffleArray(array) {
  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {
    const j =
      floor(random(i + 1));

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];
  }
}

function drawMagicEffects(characterScale) {
  const effectWidth =
    effectFrameWidth * characterScale;

  const effectHeight =
    effectFrameHeight * characterScale;

  const effectSpeed =
    max(6, width * 0.008);

  for (
    let effectIndex = activeEffects.length - 1;
    effectIndex >= 0;
    effectIndex--
  ) {
    const effect =
      activeEffects[effectIndex];

    effect.x +=
      effect.direction * effectSpeed;

    if (
      effect.x > width ||
      effect.x < 0
    ) {
      activeEffects.splice(
        effectIndex,
        1
      );

      continue;
    }

    const effectFrameIndex =
      floor(frameCount / framesPerStep) %
      effectFrameCount;

    push();

    translate(
      effect.x,
      effect.y
    );

    scale(
      effect.direction,
      1
    );

    image(
      magicEffectSprite,
      0,
      0,
      effectWidth,
      effectHeight,
      effectFrameIndex * effectFrameWidth,
      0,
      effectFrameWidth,
      effectFrameHeight
    );

    pop();
  }
}

function createFireworks() {
  fireworks = [];

  const centerX = width / 2;
  const centerY = height * 0.28;

  for (let i = 0; i < 4; i++) {
    const originX =
      centerX + random(-width * 0.2, width * 0.2);

    const originY =
      centerY + random(-height * 0.08, height * 0.08);

    const particles = [];

    for (let j = 0; j < 45; j++) {
      const angle =
        random(TWO_PI);

      const speed =
        random(2, 7);

      particles.push({
        x: originX,
        y: originY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        size: random(2, 6),
        hue: random(360),
        life: 255
      });
    }

    fireworks.push({
      particles
    });
  }
}

function drawFireworks(progress) {
  noStroke();

  for (const firework of fireworks) {
    for (const particle of firework.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.06;
      particle.life -= 2.2;

      if (particle.life <= 0) {
        continue;
      }

      colorMode(HSB, 360, 100, 100, 255);

      fill(
        particle.hue,
        85,
        100,
        particle.life
      );

      circle(
        particle.x,
        particle.y,
        particle.size
      );
    }
  }

  colorMode(RGB, 255);
}

function createLightningBolts() {
  lightningBolts = [];

  const boltCount = 4;

  for (let i = 0; i < boltCount; i++) {
    const points = [];

    let x =
      width * 0.5 +
      random(-width * 0.2, width * 0.2);

    let y = 0;

    points.push({
      x,
      y
    });

    while (y < height * 0.75) {
      x += random(-35, 35);
      y += random(25, 65);

      points.push({
        x,
        y
      });
    }

    lightningBolts.push(points);
  }
}

function drawLightning(progress) {
  const flicker =
    random(0.5, 1);

  stroke(
    255,
    255,
    255,
    220 * flicker
  );

  strokeWeight(7);
  noFill();

  for (const bolt of lightningBolts) {
    beginShape();

    for (const point of bolt) {
      vertex(point.x, point.y);
    }

    endShape();

    stroke(
      90,
      160,
      255,
      180 * flicker
    );

    strokeWeight(2);

    beginShape();

    for (const point of bolt) {
      vertex(point.x, point.y);
    }

    endShape();

    stroke(
      255,
      255,
      255,
      220 * flicker
    );

    strokeWeight(7);
  }

  noStroke();
}

function drawSpecialEffect() {
  if (
    specialEffectType === "" ||
    specialEffectStartTime === 0
  ) {
    return;
  }

  const elapsed =
    millis() - specialEffectStartTime;

  if (elapsed >= specialEffectDuration) {
    specialEffectType = "";
    specialEffectStartTime = 0;
    fireworks = [];
    lightningBolts = [];

    return;
  }

  const progress =
    constrain(
      elapsed / specialEffectDuration,
      0,
      1
    );

  push();

  if (specialEffectType === "fireworks") {
    drawFireworks(progress);
  }

  if (specialEffectType === "lightning") {
    drawLightning(progress);
  }

  pop();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;

    return false;
  }

  if (keyCode === LEFT_ARROW) {
    isWalking = true;
    facingDirection = -1;

    return false;
  }

  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }

    spaceIsDown = true;

    return false;
  }
}

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  characterX = constrain(
    characterX,
    1,
    width - 1
  );

  updateCharacter2Position();
  updateQuestionPanelPosition();
}