(() => {
  "use strict";

  const VERSION = "0.03";

  const avatarState = {
    version: VERSION,

    engine: {
      running: false,
      frame: 0,
      fps: 0,
      startedAt: performance.now()
    },

    face: {
      lookX: 0,
      lookY: 0,
      blinkLeft: 0,
      blinkRight: 0,
      pupilScale: 1,
      autoBlink: true,
      mouthOpen: 0,
      mouthWidth: 100
    },

    head: {
      rotation: 0,
      tilt: 0,
      scale: 1
    },

    body: {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1
    },

    leftArm: {
      shoulder: 0,
      elbow: 0,
      wrist: 0
    },

    rightArm: {
      shoulder: 0,
      elbow: 0,
      wrist: 0
    },

    leftLeg: {
      hip: 0,
      knee: 0,
      foot: 0
    },

    rightLeg: {
      hip: 0,
      knee: 0,
      foot: 0
    }
  };

  const parts = new Map();

  const ui = {
    engineDot: document.getElementById("engineDot"),
    engineLabel: document.getElementById("engineLabel"),
    engineState: document.getElementById("engineState"),
    frameCount: document.getElementById("frameCount"),
    fpsValue: document.getElementById("fpsValue"),
    heartbeatText: document.getElementById("heartbeatText"),
    versionValue: document.getElementById("versionValue"),
    headPart: document.getElementById("headPart"),
    headTilt: document.getElementById("headTilt"),
    headTurn: document.getElementById("headTurn"),
    headScale: document.getElementById("headScale"),
    headTiltValue: document.getElementById("headTiltValue"),
    headTurnValue: document.getElementById("headTurnValue"),
    headScaleValue: document.getElementById("headScaleValue"),
    headReset: document.getElementById("headReset"),
    lookX: document.getElementById("lookX"),
    lookY: document.getElementById("lookY"),
    blinkLeft: document.getElementById("blinkLeft"),
    blinkRight: document.getElementById("blinkRight"),
    pupilScale: document.getElementById("pupilScale"),
    autoBlink: document.getElementById("autoBlink"),
    blinkNow: document.getElementById("blinkNow"),
    lookXValue: document.getElementById("lookXValue"),
    lookYValue: document.getElementById("lookYValue"),
    blinkLeftValue: document.getElementById("blinkLeftValue"),
    blinkRightValue: document.getElementById("blinkRightValue"),
    pupilScaleValue: document.getElementById("pupilScaleValue"),
    pupilLeft: document.getElementById("pupilLeft"),
    pupilRight: document.getElementById("pupilRight"),
    lidTopLeft: document.getElementById("lidTopLeft"),
    lidBottomLeft: document.getElementById("lidBottomLeft"),
    lidTopRight: document.getElementById("lidTopRight"),
    lidBottomRight: document.getElementById("lidBottomRight")
  };

  function registerPart(name, element) {
    if (!name || !element) return false;
    parts.set(name, element);
    return true;
  }

  function getPart(name) {
    return parts.get(name) || null;
  }

  function setState(path, value) {
    const keys = path.split(".");
    let target = avatarState;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in target)) return false;
      target = target[keys[i]];
    }

    const finalKey = keys[keys.length - 1];
    if (!(finalKey in target)) return false;

    target[finalKey] = value;
    return true;
  }

  function renderAvatar() {
    const head = avatarState.head;

    if (ui.headPart) {
      const squash = 1 - Math.min(Math.abs(head.rotation) / 220, 0.055);
      ui.headPart.style.transform =
        "translateX(" + head.rotation + "px) " +
        "rotate(" + head.tilt + "deg) " +
        "scale(" + (head.scale * squash) + "," + head.scale + ")";
    }

    if (ui.headTiltValue) {
      ui.headTiltValue.textContent = Math.round(head.tilt) + "°";
    }

    if (ui.headTurnValue) {
      ui.headTurnValue.textContent = Math.round(head.rotation) + "°";
    }

    if (ui.headScaleValue) {
      ui.headScaleValue.textContent = Math.round(head.scale * 100) + "%";
    }

    const face = avatarState.face;

    if (ui.pupilLeft && ui.pupilRight) {
      const pupilRadius = 6 * face.pupilScale;
      ui.pupilLeft.setAttribute("cx", 139 + face.lookX);
      ui.pupilRight.setAttribute("cx", 221 + face.lookX);
      ui.pupilLeft.setAttribute("cy", 174 + face.lookY);
      ui.pupilRight.setAttribute("cy", 174 + face.lookY);
      ui.pupilLeft.setAttribute("r", pupilRadius);
      ui.pupilRight.setAttribute("r", pupilRadius);
    }

    const maxLid = 18;
    const leftClose = Math.max(0, Math.min(100, face.blinkLeft)) / 100 * maxLid;
    const rightClose = Math.max(0, Math.min(100, face.blinkRight)) / 100 * maxLid;

    if (ui.lidTopLeft && ui.lidBottomLeft) {
      ui.lidTopLeft.setAttribute("height", leftClose);
      ui.lidBottomLeft.setAttribute("height", leftClose);
      ui.lidBottomLeft.setAttribute("y", 192 - leftClose);
    }

    if (ui.lidTopRight && ui.lidBottomRight) {
      ui.lidTopRight.setAttribute("height", rightClose);
      ui.lidBottomRight.setAttribute("height", rightClose);
      ui.lidBottomRight.setAttribute("y", 192 - rightClose);
    }

    if (ui.lookXValue) ui.lookXValue.textContent = Math.round(face.lookX);
    if (ui.lookYValue) ui.lookYValue.textContent = Math.round(face.lookY);
    if (ui.blinkLeftValue) ui.blinkLeftValue.textContent = Math.round(face.blinkLeft) + "%";
    if (ui.blinkRightValue) ui.blinkRightValue.textContent = Math.round(face.blinkRight) + "%";
    if (ui.pupilScaleValue) ui.pupilScaleValue.textContent = Math.round(face.pupilScale * 100) + "%";
  }

  let lastFpsTime = performance.now();
  let framesThisSecond = 0;

  function updateEngineUi(now) {
    framesThisSecond++;

    if (now - lastFpsTime >= 1000) {
      avatarState.engine.fps = framesThisSecond;
      framesThisSecond = 0;
      lastFpsTime = now;

      ui.fpsValue.textContent = avatarState.engine.fps;
    }

    if (avatarState.engine.frame % 30 === 0) {
      ui.frameCount.textContent = avatarState.engine.frame.toLocaleString("de-DE");
      ui.heartbeatText.textContent =
        "Engine läuft · Frame " +
        avatarState.engine.frame.toLocaleString("de-DE") +
        " · Schritt 3 aktiv: Augen & Pupillen";
    }
  }

  function engineLoop(now) {
    avatarState.engine.frame++;

    renderAvatar();
    updateEngineUi(now);

    requestAnimationFrame(engineLoop);
  }

  function bindHeadControls() {
    if (ui.headTilt) {
      ui.headTilt.addEventListener("input", () => {
        avatarState.head.tilt = Number(ui.headTilt.value);
        renderAvatar();
      });
    }

    if (ui.headTurn) {
      ui.headTurn.addEventListener("input", () => {
        avatarState.head.rotation = Number(ui.headTurn.value);
        renderAvatar();
      });
    }

    if (ui.headScale) {
      ui.headScale.addEventListener("input", () => {
        avatarState.head.scale = Number(ui.headScale.value) / 100;
        renderAvatar();
      });
    }

    if (ui.headReset) {
      ui.headReset.addEventListener("click", () => {
        avatarState.head.rotation = 0;
        avatarState.head.tilt = 0;
        avatarState.head.scale = 1;

        ui.headTilt.value = 0;
        ui.headTurn.value = 0;
        ui.headScale.value = 100;

        renderAvatar();
      });
    }

    registerPart("head", ui.headPart);
  }

  let blinkTimer = null;
  let autoBlinkTimer = null;

  function syncEyeControls() {
    if (ui.lookX) ui.lookX.value = avatarState.face.lookX;
    if (ui.lookY) ui.lookY.value = avatarState.face.lookY;
    if (ui.blinkLeft) ui.blinkLeft.value = avatarState.face.blinkLeft;
    if (ui.blinkRight) ui.blinkRight.value = avatarState.face.blinkRight;
    if (ui.pupilScale) ui.pupilScale.value = Math.round(avatarState.face.pupilScale * 100);
    if (ui.autoBlink) ui.autoBlink.checked = avatarState.face.autoBlink;
  }

  function blinkOnce() {
    if (blinkTimer) clearInterval(blinkTimer);

    const sequence = [15, 45, 80, 100, 75, 35, 0];
    let index = 0;

    blinkTimer = setInterval(() => {
      const value = sequence[index++];
      avatarState.face.blinkLeft = value;
      avatarState.face.blinkRight = value;

      if (ui.blinkLeft) ui.blinkLeft.value = value;
      if (ui.blinkRight) ui.blinkRight.value = value;

      renderAvatar();

      if (index >= sequence.length) {
        clearInterval(blinkTimer);
        blinkTimer = null;
      }
    }, 45);
  }

  function scheduleAutoBlink() {
    if (autoBlinkTimer) clearTimeout(autoBlinkTimer);
    if (!avatarState.face.autoBlink) return;

    const delay = 2400 + Math.random() * 2600;

    autoBlinkTimer = setTimeout(() => {
      blinkOnce();
      scheduleAutoBlink();
    }, delay);
  }

  function bindEyeControls() {
    if (ui.lookX) {
      ui.lookX.addEventListener("input", () => {
        avatarState.face.lookX = Number(ui.lookX.value);
        renderAvatar();
      });
    }

    if (ui.lookY) {
      ui.lookY.addEventListener("input", () => {
        avatarState.face.lookY = Number(ui.lookY.value);
        renderAvatar();
      });
    }

    if (ui.blinkLeft) {
      ui.blinkLeft.addEventListener("input", () => {
        avatarState.face.blinkLeft = Number(ui.blinkLeft.value);
        renderAvatar();
      });
    }

    if (ui.blinkRight) {
      ui.blinkRight.addEventListener("input", () => {
        avatarState.face.blinkRight = Number(ui.blinkRight.value);
        renderAvatar();
      });
    }

    if (ui.pupilScale) {
      ui.pupilScale.addEventListener("input", () => {
        avatarState.face.pupilScale = Number(ui.pupilScale.value) / 100;
        renderAvatar();
      });
    }

    if (ui.blinkNow) {
      ui.blinkNow.addEventListener("click", blinkOnce);
    }

    if (ui.autoBlink) {
      ui.autoBlink.addEventListener("change", () => {
        avatarState.face.autoBlink = ui.autoBlink.checked;
        scheduleAutoBlink();
      });
    }

    registerPart("eyes", document.getElementById("eyesModule"));
    syncEyeControls();
    scheduleAutoBlink();
  }

  function startEngine() {
    avatarState.engine.running = true;

    ui.engineDot.classList.add("running");
    ui.engineLabel.textContent = "Engine läuft";
    ui.engineState.textContent = "RUNNING";
    ui.versionValue.textContent = VERSION;

    requestAnimationFrame(engineLoop);
  }

  bindHeadControls();
  bindEyeControls();
  renderAvatar();

  window.PSAvatarEngine = {
    state: avatarState,
    registerPart,
    getPart,
    setState,
    render: renderAvatar,
    version: VERSION
  };

  startEngine();
})();
