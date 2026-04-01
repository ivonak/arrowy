import { useEffect, useRef } from 'react';
import { vertexSrc, fragmentSrc } from './shaders';

function hexToRgb01(hex) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const num = parseInt(v, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
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

const MAX_POINTS = 8;

export default function useGrainRenderer(canvasRef, configRef) {
  const internals = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
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

    const u = {};
    const scalarNames = [
      'u_resolution', 'u_time', 'u_gradientMode', 'u_bgColor',
      'u_bgColor1', 'u_bgColor2', 'u_bgColor3',
      'u_gradientAngle', 'u_gradientMidpoint', 'u_gradientType',
      'u_cpCount', 'u_noiseScale', 'u_noiseAmount',
      'u_warpScale', 'u_warpAmount', 'u_warpScale2', 'u_warpAmount2', 'u_warpSpeed',
      'u_grainScale', 'u_grainAmount', 'u_grainSpeed', 'u_grainBlendMode',
      'u_grainContrast', 'u_grainBrightness', 'u_grainSoftness', 'u_grainDensity',
    ];
    scalarNames.forEach(name => { u[name] = gl.getUniformLocation(program, name); });

    for (let i = 0; i < MAX_POINTS; i++) {
      u[`cpPos${i}`] = gl.getUniformLocation(program, `u_cpPos[${i}]`);
      u[`cpColor${i}`] = gl.getUniformLocation(program, `u_cpColor[${i}]`);
      u[`cpWidth${i}`] = gl.getUniformLocation(program, `u_cpWidth[${i}]`);
      u[`cpHeight${i}`] = gl.getUniformLocation(program, `u_cpHeight[${i}]`);
      u[`cpAngle${i}`] = gl.getUniformLocation(program, `u_cpAngle[${i}]`);
      u[`cpIntensity${i}`] = gl.getUniformLocation(program, `u_cpIntensity[${i}]`);
    }

    let lastParentW = 0, lastParentH = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const BLEND_MAP = { normal: 0, overlay: 1, screen: 2, multiply: 3, softLight: 4 };

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

      const bg1 = hexToRgb01(cfg.bgColor1);
      const bg2 = hexToRgb01(cfg.bgColor2);
      const bg3 = hexToRgb01(cfg.bgColor3);

      gl.useProgram(program);
      gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(u.u_time, timeMs / 1000);
      gl.uniform1f(u.u_gradientMode, cfg.gradientMode === 'shader' ? 1 : 0);
      gl.uniform3f(u.u_bgColor, ...hexToRgb01(cfg.bgColor || '#ffffff'));

      gl.uniform3f(u.u_bgColor1, ...bg1);
      gl.uniform3f(u.u_bgColor2, ...bg2);
      gl.uniform3f(u.u_bgColor3, ...bg3);
      gl.uniform1f(u.u_gradientAngle, cfg.gradientAngle);
      gl.uniform1f(u.u_gradientMidpoint, cfg.gradientMidpoint);
      gl.uniform1f(u.u_gradientType, cfg.gradientType === 'radial' ? 1 : 0);

      const points = cfg.shaderPoints || [];
      gl.uniform1f(u.u_cpCount, points.length);
      gl.uniform1f(u.u_noiseScale, cfg.shaderNoiseScale ?? 2.0);
      gl.uniform1f(u.u_noiseAmount, cfg.shaderNoiseAmount ?? 0.04);
      gl.uniform1f(u.u_warpScale, cfg.shaderWarpScale ?? 2.5);
      gl.uniform1f(u.u_warpAmount, cfg.shaderWarpAmount ?? 0.12);
      gl.uniform1f(u.u_warpScale2, cfg.shaderWarpScale2 ?? 4.0);
      gl.uniform1f(u.u_warpAmount2, cfg.shaderWarpAmount2 ?? 0.06);
      gl.uniform1f(u.u_warpSpeed, cfg.shaderWarpSpeed ?? 0.15);

      for (let i = 0; i < MAX_POINTS; i++) {
        if (i < points.length) {
          const p = points[i];
          gl.uniform2f(u[`cpPos${i}`], p.x, p.y);
          gl.uniform3f(u[`cpColor${i}`], ...hexToRgb01(p.color));
          gl.uniform1f(u[`cpWidth${i}`], p.width ?? p.radius ?? 0.3);
          gl.uniform1f(u[`cpHeight${i}`], p.height ?? p.radius ?? 0.3);
          gl.uniform1f(u[`cpAngle${i}`], p.angle ?? 0);
          gl.uniform1f(u[`cpIntensity${i}`], p.intensity);
        } else {
          gl.uniform2f(u[`cpPos${i}`], 0, 0);
          gl.uniform3f(u[`cpColor${i}`], 0, 0, 0);
          gl.uniform1f(u[`cpWidth${i}`], 0.001);
          gl.uniform1f(u[`cpHeight${i}`], 0.001);
          gl.uniform1f(u[`cpAngle${i}`], 0);
          gl.uniform1f(u[`cpIntensity${i}`], 0);
        }
      }

      gl.uniform1f(u.u_grainScale, cfg.grainScale);
      gl.uniform1f(u.u_grainAmount, cfg.grainAmount);
      gl.uniform1f(u.u_grainSpeed, cfg.grainSpeed);
      gl.uniform1f(u.u_grainBlendMode, BLEND_MAP[cfg.grainBlendMode] ?? 0);

      gl.uniform1f(u.u_grainContrast, cfg.grainContrast);
      gl.uniform1f(u.u_grainBrightness, cfg.grainBrightness);
      gl.uniform1f(u.u_grainSoftness, cfg.grainSoftness);
      gl.uniform1f(u.u_grainDensity, cfg.grainDensity);

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
