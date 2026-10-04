(() => {
  "use strict";

  const VERSION = "0.02";

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
    headReset: document.getElementById("headReset")
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
        " · bereit für Schritt 2";
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

  function startEngine() {
    avatarState.engine.running = true;

    ui.engineDot.classList.add("running");
    ui.engineLabel.textContent = "Engine läuft";
    ui.engineState.textContent = "RUNNING";
    ui.versionValue.textContent = VERSION;

    requestAnimationFrame(engineLoop);
  }

  bindHeadControls();
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
