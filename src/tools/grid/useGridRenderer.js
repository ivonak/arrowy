import { useEffect, useRef } from 'react';
import { vertexSrc, fragmentSrc } from './shaders';

const SHAPE_MAP = { circle: 0, ellipse: 1, roundedSquare: 2, randomBlob: 3 };

function hexToRgb01(hex) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const num = parseInt(v, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function compileShader(gl, src, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function useGridRenderer(canvasRef, configRef) {
  const internals = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) { console.error('WebGL required'); return; }

    const vs = compileShader(gl, vertexSrc, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const posLoc = gl.getAttribLocation(program, 'a_pos');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 0);

    const u = {};
    const uNames = [
      'u_resolution','u_contact','u_dir','u_dotColor','u_dotBaseOpacity','u_dotFinalOpacity',
      'u_gridSpacing','u_dotSize','u_influenceRadius','u_shapeType','u_shapeStretchX','u_shapeStretchY',
      'u_blobSeed','u_blobLobes','u_blobJaggedness','u_blobScale','u_ballRoundness',
      'u_compressionStrength','u_dotSeparation','u_dotSharpness',
      'u_grainAmount','u_grainBackColor','u_grainFrontColor','u_grainBackOpacity','u_grainFrontOpacity',
      'u_grainBgMode','u_grainBlendMode','u_grainPresence','u_grainCoverage','u_grainBreakup',
      'u_grainThreshold','u_grainContrast','u_grainLift','u_grainGamma','u_grainDither',
      'u_grainBias','u_grainOffset','u_grainEdgeSoftness',
      'u_grainIntensity','u_grainRadialFalloff','u_grainEdgeSteepness',
      'u_grainDensityScale','u_grainFalloffOnset',
    ];
    uNames.forEach(name => { u[name] = gl.getUniformLocation(program, name); });

    const motionSeeds = { x1: Math.random()*10, x2: Math.random()*10, y1: Math.random()*10, y2: Math.random()*10 };
    const motionState = { x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastFrameMs = 0;
    let lastParentW = 0, lastParentH = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let rafId = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      motionState.x = w * 0.5;
      motionState.y = h * 0.5;
      motionState.lastX = motionState.x;
      motionState.lastY = motionState.y;
    }

    function getTargetPoint(timeSec, w, h, cfg) {
      const speed = 0.05 + Math.pow(cfg.motionSpeed, 1.45) * 0.95;
      const t = timeSec * speed;
      const waveX = w * cfg.waveAmount;
      const waveY = h * cfg.waveAmount;
      const orbit = t * 0.9 + motionSeeds.x1;
      const drift = t * 0.43 + motionSeeds.x2;
      return {
        x: w*0.5 + Math.cos(orbit)*w*0.2 + Math.cos(orbit*0.52+drift)*waveX*0.55,
        y: h*0.5 + Math.sin(orbit*0.92+0.35)*h*0.18 + Math.sin(orbit*0.47+drift+1.1)*waveY*0.55,
      };
    }

    function updateContactPoint(target, dt) {
      motionState.lastX = motionState.x;
      motionState.lastY = motionState.y;
      const blend = 1 - Math.exp(-8.8 * dt);
      motionState.x += (target.x - motionState.x) * blend;
      motionState.y += (target.y - motionState.y) * blend;
      const ivx = (motionState.x - motionState.lastX) / Math.max(0.001, dt);
      const ivy = (motionState.y - motionState.lastY) / Math.max(0.001, dt);
      motionState.vx = motionState.vx * 0.78 + ivx * 0.22;
      motionState.vy = motionState.vy * 0.78 + ivy * 0.22;
      return motionState;
    }

    function frame(timeMs) {
      const cfg = configRef.current;
      if (!cfg) { rafId = requestAnimationFrame(frame); return; }

      const parent = canvas.parentElement;
      if (parent) {
        const pw = parent.clientWidth, ph = parent.clientHeight;
        if (pw !== lastParentW || ph !== lastParentH) {
          lastParentW = pw;
          lastParentH = ph;
          resize();
        }
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) { rafId = requestAnimationFrame(frame); return; }

      const dt = lastFrameMs ? clamp((timeMs - lastFrameMs) / 1000, 0.001, 0.05) : 1/60;
      lastFrameMs = timeMs;

      const target = prefersReducedMotion.matches
        ? { x: w*0.5, y: h*0.5 }
        : getTargetPoint(timeMs/1000, w, h, cfg);
      const contact = updateContactPoint(target, dt);
      const speed = Math.hypot(contact.vx, contact.vy);
      const dirX = speed > 0.0001 ? contact.vx/speed : 1;
      const dirY = speed > 0.0001 ? contact.vy/speed : 0;

      const dotColor = hexToRgb01(cfg.dotColor);
      const grainBackColor = hexToRgb01(cfg.grainBackColor);
      const grainFrontColor = hexToRgb01(cfg.grainFrontColor);
      const grainBgModeVal = cfg.grainBgMode === 'light' ? 1 : 0;
      const blendMap = { normal: 0, screen: 1, add: 2, multiply: 3 };
      const grainBlendModeVal = blendMap[cfg.grainBlendMode] ?? 0;
      const spread = clamp(cfg.grainSpread, 0, 1.5);
      const spreadN = spread / 1.5;
      const effGrainCoverage = clamp(cfg.grainCoverage * (1.0 + spreadN * 1.25), 0.5, 2.5);
      const effGrainThreshold = clamp(cfg.grainThreshold * (1.0 - spreadN * 0.16), 0.6, 1.2);
      const effGrainEdgeSoftness = clamp(cfg.grainEdgeSoftness + spreadN * 0.22, 0, 1);
      const effGrainPresence = clamp(cfg.grainPresence * (1.0 + spreadN * 0.32), 0, 2);
      const effGrainBreakup = clamp(cfg.grainBreakup * (1.0 + spreadN * 0.22), 0, 1.5);
      const effGrainDither = clamp(cfg.grainDither * (1.0 + spreadN * 0.35), 0, 5);
      const shapeType = SHAPE_MAP[cfg.shapeType] ?? 0;

      gl.useProgram(program);
      gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(u.u_contact, contact.x*dpr, (h-contact.y)*dpr);
      gl.uniform2f(u.u_dir, dirX, -dirY);
      gl.uniform3f(u.u_dotColor, ...dotColor);
      gl.uniform1f(u.u_dotBaseOpacity, cfg.dotOpacity);
      gl.uniform1f(u.u_dotFinalOpacity, cfg.dotFinalOpacity);
      gl.uniform1f(u.u_gridSpacing, cfg.gridSpacing * dpr);
      gl.uniform1f(u.u_dotSize, cfg.dotSize * dpr);
      gl.uniform1f(u.u_influenceRadius, cfg.influenceRadius * dpr);
      gl.uniform1f(u.u_shapeType, shapeType);
      gl.uniform1f(u.u_shapeStretchX, cfg.shapeStretchX);
      gl.uniform1f(u.u_shapeStretchY, cfg.shapeStretchY);
      gl.uniform1f(u.u_blobSeed, cfg.blobSeed);
      gl.uniform1f(u.u_blobLobes, cfg.blobLobes);
      gl.uniform1f(u.u_blobJaggedness, cfg.blobJaggedness);
      gl.uniform1f(u.u_blobScale, cfg.blobScale);
      gl.uniform1f(u.u_ballRoundness, cfg.ballRoundness);
      gl.uniform1f(u.u_compressionStrength, cfg.compressionStrength);
      gl.uniform1f(u.u_dotSeparation, cfg.dotSeparation);
      gl.uniform1f(u.u_dotSharpness, cfg.dotSharpness);
      gl.uniform1f(u.u_grainAmount, cfg.grainEnabled ? cfg.grainAmount : 0.0);
      gl.uniform3f(u.u_grainBackColor, ...grainBackColor);
      gl.uniform3f(u.u_grainFrontColor, ...grainFrontColor);
      gl.uniform1f(u.u_grainBackOpacity, cfg.grainBackOpacity);
      gl.uniform1f(u.u_grainFrontOpacity, cfg.grainFrontOpacity);
      gl.uniform1f(u.u_grainBgMode, grainBgModeVal);
      gl.uniform1f(u.u_grainBlendMode, grainBlendModeVal);
      gl.uniform1f(u.u_grainPresence, effGrainPresence);
      gl.uniform1f(u.u_grainCoverage, effGrainCoverage);
      gl.uniform1f(u.u_grainBreakup, effGrainBreakup);
      gl.uniform1f(u.u_grainThreshold, effGrainThreshold);
      gl.uniform1f(u.u_grainContrast, cfg.grainContrast);
      gl.uniform1f(u.u_grainLift, cfg.grainLift);
      gl.uniform1f(u.u_grainGamma, cfg.grainGamma);
      gl.uniform1f(u.u_grainDither, effGrainDither);
      gl.uniform1f(u.u_grainBias, cfg.grainBias);
      gl.uniform1f(u.u_grainOffset, cfg.grainOffset);
      gl.uniform1f(u.u_grainEdgeSoftness, effGrainEdgeSoftness);
      gl.uniform1f(u.u_grainIntensity, cfg.grainIntensity);
      gl.uniform1f(u.u_grainRadialFalloff, cfg.grainRadialFalloff);
      gl.uniform1f(u.u_grainEdgeSteepness, cfg.grainEdgeSteepness);
      gl.uniform1f(u.u_grainDensityScale, cfg.grainDensityScale);
      gl.uniform1f(u.u_grainFalloffOnset, cfg.grainFalloffOnset);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(frame);

    internals.current = { gl, program, resize };

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [canvasRef, configRef]);

  return internals;
}
