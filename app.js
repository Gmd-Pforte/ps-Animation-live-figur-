(() => {
  "use strict";

  const VERSION = "0.01";

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
      tilt: 0
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
    versionValue: document.getElementById("versionValue")
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
    // Ab Schritt 2 werden hier Kopf und später Körperteile gerendert.
    // Die Funktion bleibt dauerhaft der zentrale Render-Einstiegspunkt.
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

  function startEngine() {
    avatarState.engine.running = true;

    ui.engineDot.classList.add("running");
    ui.engineLabel.textContent = "Engine läuft";
    ui.engineState.textContent = "RUNNING";
    ui.versionValue.textContent = VERSION;

    requestAnimationFrame(engineLoop);
  }

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
