(function () {
  const STORAGE_KEY = "grid_playground_settings_v1";
  const PRESETS_STORAGE_KEY = "grid_playground_presets_v1";
  const SECTION_STATE_KEY = "grid_playground_section_state_v1";
  const defaults = {
    bgStart: "#1a1a2e",
    bgMid: "#16213e",
    bgEnd: "#0f3460",
    dotColor: "#ffffff",
    dotOpacity: 0.06,
    dotFinalOpacity: 0.55,
    gridSpacing: 24,
    dotSize: 1,
    influenceRadius: 180,
    shapeType: "circle",
    shapeStretchX: 1,
    shapeStretchY: 1,
    blobSeed: 127,
    blobLobes: 6,
    blobJaggedness: 0.25,
    blobScale: 1,
    ballRoundness: 0.7,
    compressionStrength: 0.62,
    dotSeparation: 1.05,
    dotSharpness: 1.3,
    grainEnabled: true,
    grainAmount: 0.35,
    grainBackColor: "#6f7fa8",
    grainFrontColor: "#ffffff",
    grainBackOpacity: 1.0,
    grainFrontOpacity: 1.0,
    grainBgMode: "dark",
    grainBlendMode: "normal",
    grainSpread: 0.35,
    grainContrast: 1.1,
    grainPresence: 1.0,
    grainCoverage: 1.0,
    grainBreakup: 0.65,
    grainThreshold: 1.0,
    grainLift: 0.45,
    grainGamma: 1.15,
    grainDither: 0.9,
    grainBias: 0.35,
    grainOffset: 0.35,
    grainEdgeSoftness: 0.65,
    grainIntensity: 0.15,
    grainRadialFalloff: 2.0,
    grainEdgeSteepness: 1.0,
    grainDensityScale: 1.0,
    grainFalloffOnset: 1.0,
    motionSpeed: 0.55,
    waveAmount: 0.14,
  };

  const SHAPE_MAP = { circle: 0, ellipse: 1, roundedSquare: 2, randomBlob: 3 };

  const gridCanvasWrap = document.getElementById("gridCanvas");
  const canvas = document.getElementById("grid");
  const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL is required for this view.");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionSeeds = { x1: Math.random() * 10, x2: Math.random() * 10, y1: Math.random() * 10, y2: Math.random() * 10 };
  const motionState = { x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 };
  let lastFrameMs = 0;
  let dpr = window.devicePixelRatio || 1;

  const inputs = {
    bgStart: document.getElementById("bgStart"),
    bgMid: document.getElementById("bgMid"),
    bgEnd: document.getElementById("bgEnd"),
    dotColor: document.getElementById("dotColor"),
    dotOpacity: document.getElementById("dotOpacity"),
    dotFinalOpacity: document.getElementById("dotFinalOpacity"),
    gridSpacing: document.getElementById("gridSpacing"),
    dotSize: document.getElementById("dotSize"),
    influenceRadius: document.getElementById("influenceRadius"),
    shapeType: document.getElementById("shapeType"),
    shapeStretchX: document.getElementById("shapeStretchX"),
    shapeStretchY: document.getElementById("shapeStretchY"),
    blobLobes: document.getElementById("blobLobes"),
    blobJaggedness: document.getElementById("blobJaggedness"),
    blobScale: document.getElementById("blobScale"),
    ballRoundness: document.getElementById("ballRoundness"),
    compressionStrength: document.getElementById("compressionStrength"),
    dotSeparation: document.getElementById("dotSeparation"),
    dotSharpness: document.getElementById("dotSharpness"),
    grainEnabled: document.getElementById("grainEnabled"),
    grainAmount: document.getElementById("grainAmount"),
    grainBackColor: document.getElementById("grainBackColor"),
    grainFrontColor: document.getElementById("grainFrontColor"),
    grainBackOpacity: document.getElementById("grainBackOpacity"),
    grainFrontOpacity: document.getElementById("grainFrontOpacity"),
    grainBgMode: document.getElementById("grainBgMode"),
    grainBlendMode: document.getElementById("grainBlendMode"),
    grainSpread: document.getElementById("grainSpread"),
    grainBias: document.getElementById("grainBias"),
    grainOffset: document.getElementById("grainOffset"),
    grainIntensity: document.getElementById("grainIntensity"),
    grainRadialFalloff: document.getElementById("grainRadialFalloff"),
    grainEdgeSteepness: document.getElementById("grainEdgeSteepness"),
    grainDensityScale: document.getElementById("grainDensityScale"),
    grainFalloffOnset: document.getElementById("grainFalloffOnset"),
    motionSpeed: document.getElementById("motionSpeed"),
    waveAmount: document.getElementById("waveAmount"),
  };

  const values = {
    dotOpacity: document.getElementById("dotOpacityValue"),
    dotFinalOpacity: document.getElementById("dotFinalOpacityValue"),
    gridSpacing: document.getElementById("gridSpacingValue"),
    dotSize: document.getElementById("dotSizeValue"),
    influenceRadius: document.getElementById("influenceRadiusValue"),
    shapeStretchX: document.getElementById("shapeStretchXValue"),
    shapeStretchY: document.getElementById("shapeStretchYValue"),
    blobLobes: document.getElementById("blobLobesValue"),
    blobJaggedness: document.getElementById("blobJaggednessValue"),
    blobScale: document.getElementById("blobScaleValue"),
    ballRoundness: document.getElementById("ballRoundnessValue"),
    compressionStrength: document.getElementById("compressionStrengthValue"),
    dotSeparation: document.getElementById("dotSeparationValue"),
    dotSharpness: document.getElementById("dotSharpnessValue"),
    grainAmount: document.getElementById("grainAmountValue"),
    grainBackOpacity: document.getElementById("grainBackOpacityValue"),
    grainFrontOpacity: document.getElementById("grainFrontOpacityValue"),
    grainSpread: document.getElementById("grainSpreadValue"),
    grainBias: document.getElementById("grainBiasValue"),
    grainOffset: document.getElementById("grainOffsetValue"),
    grainIntensity: document.getElementById("grainIntensityValue"),
    grainRadialFalloff: document.getElementById("grainRadialFalloffValue"),
    grainEdgeSteepness: document.getElementById("grainEdgeSteepnessValue"),
    grainDensityScale: document.getElementById("grainDensityScaleValue"),
    grainFalloffOnset: document.getElementById("grainFalloffOnsetValue"),
    motionSpeed: document.getElementById("motionSpeedValue"),
    waveAmount: document.getElementById("waveAmountValue"),
  };

  const presetNameInput = document.getElementById("presetName");
  const presetList = document.getElementById("presetList");
  const presetStatus = document.getElementById("presetStatus");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const loadPresetBtn = document.getElementById("loadPresetBtn");
  const overwritePresetBtn = document.getElementById("overwritePresetBtn");
  const renamePresetBtn = document.getElementById("renamePresetBtn");
  const deletePresetBtn = document.getElementById("deletePresetBtn");
  const regenBlobBtn = document.getElementById("regenBlobBtn");
  const invertGrainColorsBtn = document.getElementById("invertGrainColorsBtn");
  const panelSections = Array.from(document.querySelectorAll("#panel .section"));

  let blobSeed = defaults.blobSeed;

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function hexToRgb01(hex) {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
    const num = parseInt(value, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function readConfig() {
    return {
      bgStart: inputs.bgStart.value,
      bgMid: inputs.bgMid.value,
      bgEnd: inputs.bgEnd.value,
      dotColor: inputs.dotColor.value,
      dotOpacity: clamp(parseFloat(inputs.dotOpacity.value), 0.01, 0.25),
      dotFinalOpacity: clamp(parseFloat(inputs.dotFinalOpacity.value), 0.05, 1),
      gridSpacing: clamp(parseInt(inputs.gridSpacing.value, 10), 10, 60),
      dotSize: clamp(parseFloat(inputs.dotSize.value), 0.6, 2.4),
      influenceRadius: clamp(parseFloat(inputs.influenceRadius.value), 40, 420),
      shapeType: inputs.shapeType.value,
      shapeStretchX: clamp(parseFloat(inputs.shapeStretchX.value), 0.6, 1.6),
      shapeStretchY: clamp(parseFloat(inputs.shapeStretchY.value), 0.6, 1.6),
      blobSeed,
      blobLobes: clamp(parseFloat(inputs.blobLobes.value), 2, 12),
      blobJaggedness: clamp(parseFloat(inputs.blobJaggedness.value), 0, 0.8),
      blobScale: clamp(parseFloat(inputs.blobScale.value), 0.6, 1.4),
      ballRoundness: clamp(parseFloat(inputs.ballRoundness.value), 0, 1.2),
      compressionStrength: clamp(parseFloat(inputs.compressionStrength.value), 0, 1.2),
      dotSeparation: clamp(parseFloat(inputs.dotSeparation.value), 0.75, 1.8),
      dotSharpness: clamp(parseFloat(inputs.dotSharpness.value), 0.6, 2.2),
      grainEnabled: inputs.grainEnabled.checked,
      grainAmount: clamp(parseFloat(inputs.grainAmount.value), 0, 1),
      grainBackColor: inputs.grainBackColor.value,
      grainFrontColor: inputs.grainFrontColor.value,
      grainBackOpacity: clamp(parseFloat(inputs.grainBackOpacity.value), 0, 1.5),
      grainFrontOpacity: clamp(parseFloat(inputs.grainFrontOpacity.value), 0, 1.5),
      grainBgMode: inputs.grainBgMode.value,
      grainBlendMode: inputs.grainBlendMode.value,
      grainSpread: clamp(parseFloat(inputs.grainSpread.value), 0, 1.5),
      grainPresence: defaults.grainPresence,
      grainCoverage: defaults.grainCoverage,
      grainBreakup: defaults.grainBreakup,
      grainThreshold: defaults.grainThreshold,
      grainContrast: defaults.grainContrast,
      grainLift: defaults.grainLift,
      grainGamma: defaults.grainGamma,
      grainDither: defaults.grainDither,
      grainBias: clamp(parseFloat(inputs.grainBias.value), -1, 1),
      grainOffset: clamp(parseFloat(inputs.grainOffset.value), -2, 2),
      grainEdgeSoftness: defaults.grainEdgeSoftness,
      grainIntensity: clamp(parseFloat(inputs.grainIntensity.value), 0.01, 0.5),
      grainRadialFalloff: clamp(parseFloat(inputs.grainRadialFalloff.value), 0.5, 12),
      grainEdgeSteepness: clamp(parseFloat(inputs.grainEdgeSteepness.value), 0.3, 5),
      grainDensityScale: clamp(parseFloat(inputs.grainDensityScale.value), 0.02, 1),
      grainFalloffOnset: clamp(parseFloat(inputs.grainFalloffOnset.value), 0, 1),
      motionSpeed: clamp(parseFloat(inputs.motionSpeed.value), 0.01, 1.4),
      waveAmount: clamp(parseFloat(inputs.waveAmount.value), 0.04, 0.34),
                      };
  }

  function writeConfig(cfg) {
    blobSeed = Number.isFinite(cfg.blobSeed) ? cfg.blobSeed : blobSeed;
    Object.keys(inputs).forEach((key) => {
      if (cfg[key] === undefined) return;
      if (inputs[key].type === 'checkbox') inputs[key].checked = !!cfg[key];
      else inputs[key].value = cfg[key];
    });
  }

  function renderValueLabels(cfg) {
    values.dotOpacity.textContent = cfg.dotOpacity.toFixed(2);
    values.dotFinalOpacity.textContent = cfg.dotFinalOpacity.toFixed(2);
    values.gridSpacing.textContent = `${cfg.gridSpacing} px`;
    values.dotSize.textContent = `${cfg.dotSize.toFixed(1)} px`;
    values.influenceRadius.textContent = `${Math.round(cfg.influenceRadius)} px`;
    values.shapeStretchX.textContent = cfg.shapeStretchX.toFixed(2);
    values.shapeStretchY.textContent = cfg.shapeStretchY.toFixed(2);
    values.blobLobes.textContent = `${Math.round(cfg.blobLobes)}`;
    values.blobJaggedness.textContent = cfg.blobJaggedness.toFixed(2);
    values.blobScale.textContent = cfg.blobScale.toFixed(2);
    values.ballRoundness.textContent = cfg.ballRoundness.toFixed(2);
    values.compressionStrength.textContent = cfg.compressionStrength.toFixed(2);
    values.dotSeparation.textContent = cfg.dotSeparation.toFixed(2);
    values.dotSharpness.textContent = cfg.dotSharpness.toFixed(2);
    values.grainAmount.textContent = cfg.grainAmount.toFixed(2);
    values.grainBackOpacity.textContent = cfg.grainBackOpacity.toFixed(2);
    values.grainFrontOpacity.textContent = cfg.grainFrontOpacity.toFixed(2);
    values.grainSpread.textContent = cfg.grainSpread.toFixed(2);
    values.grainBias.textContent = cfg.grainBias.toFixed(2);
    values.grainOffset.textContent = cfg.grainOffset.toFixed(2);
    values.grainIntensity.textContent = cfg.grainIntensity.toFixed(2);
    values.grainRadialFalloff.textContent = cfg.grainRadialFalloff.toFixed(1);
    values.grainEdgeSteepness.textContent = cfg.grainEdgeSteepness.toFixed(2);
    values.grainDensityScale.textContent = cfg.grainDensityScale.toFixed(2);
    values.grainFalloffOnset.textContent = (cfg.grainFalloffOnset * 100).toFixed(0) + '%';
    values.motionSpeed.textContent = cfg.motionSpeed.toFixed(3);
    values.waveAmount.textContent = cfg.waveAmount.toFixed(2);
  }

  function applyConfig(cfg) {
    const root = document.documentElement.style;
    root.setProperty("--bg-start", cfg.bgStart);
    root.setProperty("--bg-mid", cfg.bgMid);
    root.setProperty("--bg-end", cfg.bgEnd);
    renderValueLabels(cfg);
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  function update() {
    const cfg = readConfig();
    writeConfig(cfg);
    applyConfig(cfg);
    saveConfig(cfg);
  }

  function toSectionKey(text, index) {
    const base = String(text || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return base ? `sec_${base}` : `sec_${index}`;
  }

  function readSectionState() {
    try {
      return JSON.parse(localStorage.getItem(SECTION_STATE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveSectionState() {
    const state = {};
    panelSections.forEach((section, index) => {
      const header = section.querySelector(".section-header");
      const titleEl = section.querySelector(".section-title");
      const key = section.dataset.sectionKey || toSectionKey(titleEl ? titleEl.textContent : "", index);
      section.dataset.sectionKey = key;
      state[key] = !section.classList.contains("collapsed");
      if (header) header.dataset.sectionKey = key;
    });
    localStorage.setItem(SECTION_STATE_KEY, JSON.stringify(state));
  }

  function restoreSectionState() {
    const state = readSectionState();
    panelSections.forEach((section, index) => {
      const header = section.querySelector(".section-header");
      const titleEl = section.querySelector(".section-title");
      const key = toSectionKey(titleEl ? titleEl.textContent : "", index);
      section.dataset.sectionKey = key;
      if (header) header.dataset.sectionKey = key;
      if (state[key] === true) section.classList.remove("collapsed");
      if (state[key] === false) section.classList.add("collapsed");
    });
  }

  window.toggleSection = function toggleSection(header) {
    header.parentElement.classList.toggle("collapsed");
    saveSectionState();
  };

  function listPresets() {
    try {
      return JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writePresets(items) {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(items));
  }

  function selectedPresetId() {
    return presetList.value || null;
  }

  function setPresetStatus(text) {
    presetStatus.textContent = text || "";
  }

  function renderPresetList(selectedId = null) {
    const items = listPresets().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    presetList.innerHTML = "";
    items.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      presetList.appendChild(opt);
    });
    if (!items.length) {
      const opt = document.createElement("option");
      opt.textContent = "No presets yet";
      opt.disabled = true;
      presetList.appendChild(opt);
    } else if (selectedId) {
      presetList.value = selectedId;
    } else {
      presetList.selectedIndex = 0;
    }
  }

  function savePreset(name, config) {
    const items = listPresets();
    const preset = {
      id: `p_${Date.now()}_${Math.floor(Math.random() * 1e4)}`,
      name,
      config,
      updatedAt: Date.now()
    };
    items.push(preset);
    writePresets(items);
    renderPresetList(preset.id);
    return preset;
  }

  function loadPresetById(id) {
    const p = listPresets().find((x) => x.id === id);
    if (!p) return null;
    writeConfig({ ...defaults, ...p.config });
    const cfg = readConfig();
    applyConfig(cfg);
    saveConfig(cfg);
    return p;
  }

  function updatePresetById(id, patcher) {
    const items = listPresets();
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return null;
    items[idx] = patcher(items[idx]);
    items[idx].updatedAt = Date.now();
    writePresets(items);
    renderPresetList(items[idx].id);
    return items[idx];
  }

  function deletePresetById(id) {
    const items = listPresets().filter((x) => x.id !== id);
    writePresets(items);
    renderPresetList();
  }

  savePresetBtn.addEventListener("click", () => {
    const name = (presetNameInput.value || "").trim();
    if (!name) return setPresetStatus("Enter a preset name.");
    const p = savePreset(name, readConfig());
    setPresetStatus(`Saved: ${p.name}`);
  });

  loadPresetBtn.addEventListener("click", () => {
    const id = selectedPresetId();
    if (!id) return setPresetStatus("Select a preset first.");
    const p = loadPresetById(id);
    if (p) {
      presetNameInput.value = p.name;
      setPresetStatus(`Loaded: ${p.name}`);
    }
  });

  overwritePresetBtn.addEventListener("click", () => {
    const id = selectedPresetId();
    if (!id) return setPresetStatus("Select a preset first.");
    const p = updatePresetById(id, (prev) => ({ ...prev, config: readConfig() }));
    if (p) setPresetStatus(`Overwritten: ${p.name}`);
  });

  renamePresetBtn.addEventListener("click", () => {
    const id = selectedPresetId();
    if (!id) return setPresetStatus("Select a preset first.");
    const newName = (presetNameInput.value || "").trim();
    if (!newName) return setPresetStatus("Enter a new preset name.");
    const p = updatePresetById(id, (prev) => ({ ...prev, name: newName }));
    if (p) setPresetStatus(`Renamed to: ${p.name}`);
  });

  deletePresetBtn.addEventListener("click", () => {
    const id = selectedPresetId();
    if (!id) return setPresetStatus("Select a preset first.");
    const items = listPresets();
    const p = items.find((x) => x.id === id);
    deletePresetById(id);
    setPresetStatus(p ? `Deleted: ${p.name}` : "Preset deleted.");
  });

  regenBlobBtn.addEventListener("click", () => {
    blobSeed = Math.floor(Math.random() * 1e6);
    const cfg = readConfig();
    applyConfig(cfg);
    saveConfig(cfg);
    setPresetStatus("Regenerated blob shape.");
  });

  invertGrainColorsBtn.addEventListener("click", () => {
    const current = readConfig();
    writeConfig({
      ...current,
      grainBackColor: current.grainFrontColor,
      grainFrontColor: current.grainBackColor,
      grainBackOpacity: current.grainFrontOpacity,
      grainFrontOpacity: current.grainBackOpacity
    });
    update();
    setPresetStatus("Inverted grain back/front colors.");
  });

  const { vertexSrc, fragmentSrc } = window.GridShaders;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(err || "Shader compile failed");
    }
    return shader;
  }

  function createProgram(vsSource, fsSource) {
    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(err || "Program link failed");
    }
    return program;
  }

  const program = createProgram(vertexSrc, fragmentSrc);
  gl.useProgram(program);
  gl.clearColor(0, 0, 0, 0);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uContact = gl.getUniformLocation(program, "u_contact");
  const uDir = gl.getUniformLocation(program, "u_dir");
  const uDotColor = gl.getUniformLocation(program, "u_dotColor");
  const uDotBaseOpacity = gl.getUniformLocation(program, "u_dotBaseOpacity");
  const uDotFinalOpacity = gl.getUniformLocation(program, "u_dotFinalOpacity");
  const uGridSpacing = gl.getUniformLocation(program, "u_gridSpacing");
  const uDotSize = gl.getUniformLocation(program, "u_dotSize");
  const uInfluenceRadius = gl.getUniformLocation(program, "u_influenceRadius");
  const uShapeType = gl.getUniformLocation(program, "u_shapeType");
  const uShapeStretchX = gl.getUniformLocation(program, "u_shapeStretchX");
  const uShapeStretchY = gl.getUniformLocation(program, "u_shapeStretchY");
  const uBlobSeed = gl.getUniformLocation(program, "u_blobSeed");
  const uBlobLobes = gl.getUniformLocation(program, "u_blobLobes");
  const uBlobJaggedness = gl.getUniformLocation(program, "u_blobJaggedness");
  const uBlobScale = gl.getUniformLocation(program, "u_blobScale");
  const uBallRoundness = gl.getUniformLocation(program, "u_ballRoundness");
  const uCompressionStrength = gl.getUniformLocation(program, "u_compressionStrength");
  const uDotSeparation = gl.getUniformLocation(program, "u_dotSeparation");
  const uDotSharpness = gl.getUniformLocation(program, "u_dotSharpness");
  const uGrainAmount = gl.getUniformLocation(program, "u_grainAmount");
  const uGrainBackColor = gl.getUniformLocation(program, "u_grainBackColor");
  const uGrainFrontColor = gl.getUniformLocation(program, "u_grainFrontColor");
  const uGrainBackOpacity = gl.getUniformLocation(program, "u_grainBackOpacity");
  const uGrainFrontOpacity = gl.getUniformLocation(program, "u_grainFrontOpacity");
  const uGrainBgMode = gl.getUniformLocation(program, "u_grainBgMode");
  const uGrainBlendMode = gl.getUniformLocation(program, "u_grainBlendMode");
  const uGrainPresence = gl.getUniformLocation(program, "u_grainPresence");
  const uGrainCoverage = gl.getUniformLocation(program, "u_grainCoverage");
  const uGrainBreakup = gl.getUniformLocation(program, "u_grainBreakup");
  const uGrainThreshold = gl.getUniformLocation(program, "u_grainThreshold");
  const uGrainContrast = gl.getUniformLocation(program, "u_grainContrast");
  const uGrainLift = gl.getUniformLocation(program, "u_grainLift");
  const uGrainGamma = gl.getUniformLocation(program, "u_grainGamma");
  const uGrainDither = gl.getUniformLocation(program, "u_grainDither");
  const uGrainBias = gl.getUniformLocation(program, "u_grainBias");
  const uGrainOffset = gl.getUniformLocation(program, "u_grainOffset");
  const uGrainEdgeSoftness = gl.getUniformLocation(program, "u_grainEdgeSoftness");
  const uGrainIntensity = gl.getUniformLocation(program, "u_grainIntensity");
  const uGrainRadialFalloff = gl.getUniformLocation(program, "u_grainRadialFalloff");
  const uGrainEdgeSteepness = gl.getUniformLocation(program, "u_grainEdgeSteepness");
  const uGrainDensityScale = gl.getUniformLocation(program, "u_grainDensityScale");
  const uGrainFalloffOnset = gl.getUniformLocation(program, "u_grainFalloffOnset");

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = gridCanvasWrap.clientWidth;
    const height = gridCanvasWrap.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    motionState.x = width * 0.5;
    motionState.y = height * 0.5;
    motionState.lastX = motionState.x;
    motionState.lastY = motionState.y;
  }

  function getTargetPoint(timeSeconds, width, height, cfg) {
    const speed = 0.05 + Math.pow(cfg.motionSpeed, 1.45) * 0.95;
    const t = timeSeconds * speed;
    const waveX = width * cfg.waveAmount;
    const waveY = height * cfg.waveAmount;
    const orbit = t * 0.9 + motionSeeds.x1;
    const drift = t * 0.43 + motionSeeds.x2;
    const x = width * 0.5
      + Math.cos(orbit) * width * 0.2
      + Math.cos(orbit * 0.52 + drift) * waveX * 0.55;
    const y = height * 0.5
      + Math.sin(orbit * 0.92 + 0.35) * height * 0.18
      + Math.sin(orbit * 0.47 + drift + 1.1) * waveY * 0.55;
    return { x, y };
  }

  function updateContactPoint(target, dt) {
    motionState.lastX = motionState.x;
    motionState.lastY = motionState.y;
    const follow = 8.8;
    const blend = 1 - Math.exp(-follow * dt);
    motionState.x += (target.x - motionState.x) * blend;
    motionState.y += (target.y - motionState.y) * blend;
    const instantVx = (motionState.x - motionState.lastX) / Math.max(0.001, dt);
    const instantVy = (motionState.y - motionState.lastY) / Math.max(0.001, dt);
    motionState.vx = motionState.vx * 0.78 + instantVx * 0.22;
    motionState.vy = motionState.vy * 0.78 + instantVy * 0.22;
    return { x: motionState.x, y: motionState.y, vx: motionState.vx, vy: motionState.vy };
  }

  function render(timeMs) {
    const cfg = readConfig();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) {
      requestAnimationFrame(render);
      return;
    }
    const dt = lastFrameMs ? clamp((timeMs - lastFrameMs) / 1000, 0.001, 0.05) : 1 / 60;
    lastFrameMs = timeMs;

    const target = prefersReducedMotion.matches
      ? { x: width * 0.5, y: height * 0.5 }
      : getTargetPoint(timeMs / 1000, width, height, cfg);
    const contact = updateContactPoint(target, dt);
    const speed = Math.hypot(contact.vx, contact.vy);
    const dirX = speed > 0.0001 ? contact.vx / speed : 1;
    const dirY = speed > 0.0001 ? contact.vy / speed : 0;

    const dotColor = hexToRgb01(cfg.dotColor);
    const grainBackColor = hexToRgb01(cfg.grainBackColor);
    const grainFrontColor = hexToRgb01(cfg.grainFrontColor);
    const grainBgModeMap = { dark: 0, light: 1 };
    const grainBgMode = grainBgModeMap[cfg.grainBgMode] ?? 0;
    const grainBlendModeMap = { normal: 0, screen: 1, add: 2, multiply: 3 };
    const grainBlendMode = grainBlendModeMap[cfg.grainBlendMode] ?? 0;
    const spread = clamp(cfg.grainSpread, 0, 1.5);
    const spreadN = spread / 1.5;
    // Macro spread control: expands area and softens/boosts grain with one slider.
    const effGrainCoverage = clamp(cfg.grainCoverage * (1.0 + spreadN * 1.25), 0.5, 2.5);
    const effGrainThreshold = clamp(cfg.grainThreshold * (1.0 - spreadN * 0.16), 0.6, 1.2);
    const effGrainEdgeSoftness = clamp(cfg.grainEdgeSoftness + spreadN * 0.22, 0, 1);
    const effGrainPresence = clamp(cfg.grainPresence * (1.0 + spreadN * 0.32), 0, 2);
    const effGrainBreakup = clamp(cfg.grainBreakup * (1.0 + spreadN * 0.22), 0, 1.5);
    const effGrainDither = clamp(cfg.grainDither * (1.0 + spreadN * 0.35), 0, 5);
    const shapeType = SHAPE_MAP[cfg.shapeType] ?? SHAPE_MAP.circle;


    gl.useProgram(program);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uContact, contact.x * dpr, (height - contact.y) * dpr);
    gl.uniform2f(uDir, dirX, -dirY);
    gl.uniform3f(uDotColor, dotColor[0], dotColor[1], dotColor[2]);
    gl.uniform1f(uDotBaseOpacity, cfg.dotOpacity);
    gl.uniform1f(uDotFinalOpacity, cfg.dotFinalOpacity);
    gl.uniform1f(uGridSpacing, cfg.gridSpacing * dpr);
    gl.uniform1f(uDotSize, cfg.dotSize * dpr);
    gl.uniform1f(uInfluenceRadius, cfg.influenceRadius * dpr);
    gl.uniform1f(uShapeType, shapeType);
    gl.uniform1f(uShapeStretchX, cfg.shapeStretchX);
    gl.uniform1f(uShapeStretchY, cfg.shapeStretchY);
    gl.uniform1f(uBlobSeed, cfg.blobSeed);
    gl.uniform1f(uBlobLobes, cfg.blobLobes);
    gl.uniform1f(uBlobJaggedness, cfg.blobJaggedness);
    gl.uniform1f(uBlobScale, cfg.blobScale);
    gl.uniform1f(uBallRoundness, cfg.ballRoundness);
    gl.uniform1f(uCompressionStrength, cfg.compressionStrength);
    gl.uniform1f(uDotSeparation, cfg.dotSeparation);
    gl.uniform1f(uDotSharpness, cfg.dotSharpness);
    gl.uniform1f(uGrainAmount, cfg.grainEnabled ? cfg.grainAmount : 0.0);
    gl.uniform3f(uGrainBackColor, grainBackColor[0], grainBackColor[1], grainBackColor[2]);
    gl.uniform3f(uGrainFrontColor, grainFrontColor[0], grainFrontColor[1], grainFrontColor[2]);
    gl.uniform1f(uGrainBackOpacity, cfg.grainBackOpacity);
    gl.uniform1f(uGrainFrontOpacity, cfg.grainFrontOpacity);
    gl.uniform1f(uGrainBgMode, grainBgMode);
    gl.uniform1f(uGrainBlendMode, grainBlendMode);
    gl.uniform1f(uGrainPresence, effGrainPresence);
    gl.uniform1f(uGrainCoverage, effGrainCoverage);
    gl.uniform1f(uGrainBreakup, effGrainBreakup);
    gl.uniform1f(uGrainThreshold, effGrainThreshold);
    gl.uniform1f(uGrainContrast, cfg.grainContrast);
    gl.uniform1f(uGrainLift, cfg.grainLift);
    gl.uniform1f(uGrainGamma, cfg.grainGamma);
    gl.uniform1f(uGrainDither, effGrainDither);
    gl.uniform1f(uGrainBias, cfg.grainBias);
    gl.uniform1f(uGrainOffset, cfg.grainOffset);
    gl.uniform1f(uGrainEdgeSoftness, effGrainEdgeSoftness);
    gl.uniform1f(uGrainIntensity, cfg.grainIntensity);
    gl.uniform1f(uGrainRadialFalloff, cfg.grainRadialFalloff);
    gl.uniform1f(uGrainEdgeSteepness, cfg.grainEdgeSteepness);
    gl.uniform1f(uGrainDensityScale, cfg.grainDensityScale);
    gl.uniform1f(uGrainFalloffOnset, cfg.grainFalloffOnset);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", update);
    input.addEventListener("change", update);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    blobSeed = defaults.blobSeed;
    writeConfig({ ...defaults, blobSeed });
    update();
    renderPresetList();
    setPresetStatus("Reset to defaults.");
  });

  const initial = load();
  restoreSectionState();
  writeConfig(initial);
  applyConfig(initial);
  renderPresetList();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(render);
})();
