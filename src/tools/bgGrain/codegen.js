import { vertexSrc, fragmentSrc } from './shaders';

const MAX_POINTS = 8;

function hexLiteral(hex) {
  const n = (hex || '#000000').replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const num = parseInt(v, 16);
  const r = (((num >> 16) & 255) / 255).toFixed(4);
  const g = (((num >> 8) & 255) / 255).toFixed(4);
  const b = ((num & 255) / 255).toFixed(4);
  return `${r}, ${g}, ${b}`;
}

const patchedFragmentSrc = fragmentSrc
  .replace(
    'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n        return;',
    'gl_FragColor = vec4(bg, 1.0);\n        return;'
  )
  .replace(
    'gl_FragColor = vec4(color, alpha);',
    'gl_FragColor = vec4(color, 1.0);'
  );

export function generateReadableJS(config) {
  const c = config;
  const isShader = c.gradientMode === 'shader';
  const points = c.shaderPoints || [];
  const hasGrain = c.grainAmount > 0.001;
  const isAnimated = isShader || (hasGrain && c.grainSpeed > 0.001);
  const blendMode = { normal: 0, overlay: 1, screen: 2, multiply: 3, softLight: 4 }[c.grainBlendMode] ?? 0;

  const shaderSrc = isShader
    ? patchedFragmentSrc
    : patchedFragmentSrc
        .replace(/uniform float u_cpCount;[\s\S]*?uniform float u_warpSpeed;/m, '')
        .replace(/vec2 domainWarp[\s\S]*?vec3 computeShaderGradient[\s\S]*?\n    \}/m, '')
        .replace(/if \(u_gradientMode > 0\.5\) \{[\s\S]*?\} else \{/, '{')
        .replace('uniform float u_gradientMode;\n    uniform vec3 u_bgColor;\n', '');

  const uniformNames = [
    "'u_resolution','u_time'",
    isShader
      ? ",'u_gradientMode','u_bgColor','u_cpCount','u_noiseScale','u_noiseAmount','u_warpScale','u_warpAmount','u_warpScale2','u_warpAmount2','u_warpSpeed'"
      : ",'u_bgColor1','u_bgColor2','u_bgColor3','u_gradientAngle','u_gradientMidpoint','u_gradientType'",
    hasGrain
      ? ",'u_grainScale','u_grainAmount','u_grainSpeed','u_grainBlendMode','u_grainContrast','u_grainBrightness','u_grainSoftness','u_grainDensity'"
      : ",'u_grainAmount'",
  ].join('');

  const staticUniforms = isShader
    ? `  gl.uniform1f(u.u_gradientMode, 1);
  gl.uniform3f(u.u_bgColor, ${hexLiteral(c.bgColor || '#ffffff')});
  gl.uniform1f(u.u_cpCount, ${points.length});
  gl.uniform1f(u.u_noiseScale, ${c.shaderNoiseScale ?? 2});
  gl.uniform1f(u.u_noiseAmount, ${c.shaderNoiseAmount ?? 0.04});
  gl.uniform1f(u.u_warpScale, ${c.shaderWarpScale ?? 2.5});
  gl.uniform1f(u.u_warpAmount, ${c.shaderWarpAmount ?? 0.12});
  gl.uniform1f(u.u_warpScale2, ${c.shaderWarpScale2 ?? 4});
  gl.uniform1f(u.u_warpAmount2, ${c.shaderWarpAmount2 ?? 0.06});
  gl.uniform1f(u.u_warpSpeed, ${c.shaderWarpSpeed ?? 0.15});`
    : `  gl.uniform3f(u.u_bgColor1, ${hexLiteral(c.bgColor1)});
  gl.uniform3f(u.u_bgColor2, ${hexLiteral(c.bgColor2)});
  gl.uniform3f(u.u_bgColor3, ${hexLiteral(c.bgColor3)});
  gl.uniform1f(u.u_gradientAngle, ${c.gradientAngle});
  gl.uniform1f(u.u_gradientMidpoint, ${c.gradientMidpoint});
  gl.uniform1f(u.u_gradientType, ${c.gradientType === 'radial' ? 1 : 0});`;

  const grainUniforms = hasGrain
    ? `  gl.uniform1f(u.u_grainAmount, ${c.grainAmount});
  gl.uniform1f(u.u_grainScale, ${c.grainScale});
  gl.uniform1f(u.u_grainSpeed, ${c.grainSpeed});
  gl.uniform1f(u.u_grainBlendMode, ${blendMode});
  gl.uniform1f(u.u_grainContrast, ${c.grainContrast});
  gl.uniform1f(u.u_grainBrightness, ${c.grainBrightness});
  gl.uniform1f(u.u_grainSoftness, ${c.grainSoftness});
  gl.uniform1f(u.u_grainDensity, ${c.grainDensity});`
    : `  gl.uniform1f(u.u_grainAmount, 0);`;

  let cpLookup = '';
  let cpStatic = '';
  if (isShader) {
    cpLookup = `
  for (let i = 0; i < ${MAX_POINTS}; i++) {
    u['cpPos'+i] = gl.getUniformLocation(program, 'u_cpPos['+i+']');
    u['cpColor'+i] = gl.getUniformLocation(program, 'u_cpColor['+i+']');
    u['cpWidth'+i] = gl.getUniformLocation(program, 'u_cpWidth['+i+']');
    u['cpHeight'+i] = gl.getUniformLocation(program, 'u_cpHeight['+i+']');
    u['cpAngle'+i] = gl.getUniformLocation(program, 'u_cpAngle['+i+']');
    u['cpIntensity'+i] = gl.getUniformLocation(program, 'u_cpIntensity['+i+']');
  }`;
    const pointLines = [];
    for (let i = 0; i < MAX_POINTS; i++) {
      if (i < points.length) {
        const p = points[i];
        pointLines.push(`  gl.uniform2f(u.cpPos${i}, ${p.x}, ${p.y});`);
        pointLines.push(`  gl.uniform3f(u.cpColor${i}, ${hexLiteral(p.color)});`);
        pointLines.push(`  gl.uniform1f(u.cpWidth${i}, ${p.width ?? 0.3});`);
        pointLines.push(`  gl.uniform1f(u.cpHeight${i}, ${p.height ?? 0.3});`);
        pointLines.push(`  gl.uniform1f(u.cpAngle${i}, ${p.angle ?? 0});`);
        pointLines.push(`  gl.uniform1f(u.cpIntensity${i}, ${p.intensity ?? 0.5});`);
      } else {
        pointLines.push(`  gl.uniform2f(u.cpPos${i}, 0, 0); gl.uniform3f(u.cpColor${i}, 0, 0, 0);`);
        pointLines.push(`  gl.uniform1f(u.cpWidth${i}, 0.001); gl.uniform1f(u.cpHeight${i}, 0.001);`);
        pointLines.push(`  gl.uniform1f(u.cpAngle${i}, 0); gl.uniform1f(u.cpIntensity${i}, 0);`);
      }
    }
    cpStatic = pointLines.join('\n');
  }

  return `/**
 * Grain Background Effect — Generated by BG Grain
 */

const V = ${JSON.stringify(vertexSrc)};
const F = ${JSON.stringify(shaderSrc)};

export function createGrainBackground(container) {
  container.style.cssText += ';position:fixed;inset:0;';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { console.error('WebGL required'); return { destroy() {} }; }

  function compile(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(V, gl.VERTEX_SHADER));
  gl.attachShader(program, compile(F, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);

  const posLoc = gl.getAttribLocation(program, 'a_pos');
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  [${uniformNames}].forEach(n => { u[n] = gl.getUniformLocation(program, n); });
${cpLookup}

  gl.useProgram(program);
${staticUniforms}
${grainUniforms}
${cpStatic}

  let rafId = 0, destroyed = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function frame(ms) {
    if (destroyed) return;
    gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(u.u_time, ms / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    ${isAnimated ? 'rafId = requestAnimationFrame(frame);' : ''}
  }

  resize();
  window.addEventListener('resize', resize);
  ${isAnimated ? 'rafId = requestAnimationFrame(frame);' : 'requestAnimationFrame(frame);'}

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };
}
`;
}

const MINIFY_URL = 'https://cdn.jsdelivr.net/npm/terser@5.39.0/dist/bundle.min.js';
let terserLoad = null;

function ensureTerser() {
  if (window.Terser) return Promise.resolve();
  if (terserLoad) return terserLoad;
  terserLoad = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = MINIFY_URL;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load minifier'));
    document.head.appendChild(s);
  });
  return terserLoad;
}

export async function generateMinifiedJS(config) {
  const source = generateReadableJS(config);
  try {
    await ensureTerser();
    const result = await window.Terser.minify(source, {
      module: true, compress: true, mangle: true, format: { comments: false },
    });
    if (result?.code) return result.code;
  } catch {}
  return source;
}
