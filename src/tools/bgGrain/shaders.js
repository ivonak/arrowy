const vertexSrc = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

const fragmentSrc = `
    precision highp float;

    #define MAX_POINTS 8

    uniform vec2 u_resolution;
    uniform float u_time;

    uniform float u_gradientMode;
    uniform vec3 u_bgColor;

    uniform vec3 u_bgColor1;
    uniform vec3 u_bgColor2;
    uniform vec3 u_bgColor3;
    uniform float u_gradientAngle;
    uniform float u_gradientMidpoint;
    uniform float u_gradientType;

    uniform float u_cpCount;
    uniform vec2 u_cpPos[MAX_POINTS];
    uniform vec3 u_cpColor[MAX_POINTS];
    uniform float u_cpWidth[MAX_POINTS];
    uniform float u_cpHeight[MAX_POINTS];
    uniform float u_cpAngle[MAX_POINTS];
    uniform float u_cpIntensity[MAX_POINTS];
    uniform float u_noiseScale;
    uniform float u_noiseAmount;
    uniform float u_warpScale;
    uniform float u_warpAmount;
    uniform float u_warpScale2;
    uniform float u_warpAmount2;
    uniform float u_warpSpeed;

    uniform float u_grainScale;
    uniform float u_grainAmount;
    uniform float u_grainSpeed;
    uniform float u_grainBlendMode;

    uniform float u_grainContrast;
    uniform float u_grainBrightness;
    uniform float u_grainSoftness;
    uniform float u_grainDensity;

    // --- Simplex 2D noise (Ashima Arts) ---
    vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289v3(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                          -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289v2(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float hash12(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float hash13(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
    }

    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash12(i);
      float b = hash12(i + vec2(1.0, 0.0));
      float c = hash12(i + vec2(0.0, 1.0));
      float d = hash12(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float grainNoise(vec2 uv, float t) {
      float g1 = hash13(vec3(uv * 1.0, t));
      float g2 = hash13(vec3(uv * 2.13 + 17.3, t + 3.7));
      float g3 = hash13(vec3(uv * 4.27 - 8.6, t + 7.1));
      return g1 * 0.5 + g2 * 0.33 + g3 * 0.17;
    }

    vec3 blendOverlay(vec3 base, vec3 blend) {
      vec3 lo = 2.0 * base * blend;
      vec3 hi = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
      return mix(lo, hi, step(0.5, base));
    }

    vec3 blendSoftLight(vec3 base, vec3 blend) {
      vec3 lo = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
      vec3 hi = 2.0 * base * (1.0 - blend) + sqrt(base) * (2.0 * blend - 1.0);
      return mix(lo, hi, step(0.5, blend));
    }

    vec3 applyBlend(vec3 base, vec3 grain, float mode) {
      if (mode < 0.5) return mix(base, grain, 0.5);
      if (mode < 1.5) return blendOverlay(base, grain);
      if (mode < 2.5) return 1.0 - (1.0 - base) * (1.0 - grain);
      if (mode < 3.5) return base * grain;
      return blendSoftLight(base, grain);
    }

    vec2 domainWarp(vec2 uv) {
      float t = u_time * u_warpSpeed;
      float wx1 = snoise(uv * u_warpScale + vec2(t * 0.3, 100.0 + t * 0.17));
      float wy1 = snoise(uv * u_warpScale + vec2(100.0 - t * 0.21, t * 0.13));
      vec2 w = uv + vec2(wx1, wy1) * u_warpAmount;
      float wx2 = snoise(w * u_warpScale2 + vec2(50.0 + t * 0.11, 200.0 - t * 0.07));
      float wy2 = snoise(w * u_warpScale2 + vec2(200.0 + t * 0.09, 50.0 + t * 0.23));
      return w + vec2(wx2, wy2) * u_warpAmount2;
    }

    vec3 computeShaderGradient(vec2 uv, float aspect) {
      vec2 wuv = domainWarp(uv);

      vec3 colorSum = u_bgColor * 0.35;
      float weightSum = 0.35;

      for (int i = 0; i < MAX_POINTS; i++) {
        if (float(i) < u_cpCount) {
          vec2 delta = wuv - u_cpPos[i];
          delta.x *= aspect;

          float n1 = snoise(uv * u_noiseScale + vec2(float(i) * 7.3, 0.0));
          float n2 = snoise(uv * u_noiseScale + vec2(0.0, float(i) * 13.1 + 100.0));
          delta += vec2(n1, n2) * u_noiseAmount;

          float a = u_cpAngle[i] * 3.14159265 / 180.0;
          float ca = cos(a);
          float sa = sin(a);
          vec2 rd = vec2(delta.x * ca + delta.y * sa, -delta.x * sa + delta.y * ca);
          rd /= max(vec2(u_cpWidth[i], u_cpHeight[i]), vec2(0.001));

          float dist = length(rd);
          float w = (1.0 - smoothstep(0.0, 1.0, dist)) * u_cpIntensity[i];

          colorSum += u_cpColor[i] * w;
          weightSum += w;
        }
      }

      return colorSum / max(weightSum, 0.001);
    }

    float ellipseDist(vec2 uv, vec2 center, vec2 radius) {
      vec2 d = (uv - center) / max(radius, vec2(0.001));
      return length(d);
    }

    vec3 blobOver(vec3 base, vec3 color, float alpha) {
      return mix(base, color, clamp(alpha, 0.0, 1.0));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 centered = uv - 0.5;
      centered.x *= aspect;

      vec3 bg;

      if (u_gradientMode > 0.5) {
        vec2 screenUv = vec2(uv.x, 1.0 - uv.y);
        bg = computeShaderGradient(screenUv, aspect);
      } else {
        float angle = u_gradientAngle * 3.14159265 / 180.0;
        vec2 dir = vec2(cos(angle), sin(angle));
        float gradT;
        if (u_gradientType < 0.5) {
          gradT = dot(uv - 0.5, dir) + 0.5;
        } else {
          gradT = length(centered) * 1.414;
        }
        gradT = clamp(gradT, 0.0, 1.0);
        float mid = clamp(u_gradientMidpoint, 0.05, 0.95);
        if (gradT < mid) {
          bg = mix(u_bgColor1, u_bgColor2, gradT / mid);
        } else {
          bg = mix(u_bgColor2, u_bgColor3, (gradT - mid) / (1.0 - mid));
        }
        float d7 = ellipseDist(uv, vec2(0.36, 0.40), vec2(0.42, 0.48));
        bg = blobOver(bg, vec3(0.949, 0.922, 0.902), 0.92 * smoothstep(0.78, 0.0, d7));
        float d8 = ellipseDist(uv, vec2(0.48, 0.12), vec2(0.65, 0.30));
        bg = blobOver(bg, vec3(0.855, 0.804, 0.831), 0.22 * smoothstep(0.68, 0.0, d8));
        float d6 = ellipseDist(uv, vec2(0.97, 0.50), vec2(0.14, 0.38));
        bg = blobOver(bg, vec3(0.659, 0.580, 0.753), 0.42 * smoothstep(0.80, 0.0, d6));
        float d5 = ellipseDist(uv, vec2(0.60, 0.60), vec2(0.34, 0.38));
        bg = blobOver(bg, vec3(0.843, 0.675, 0.627), 0.30 * smoothstep(0.78, 0.0, d5));
        float d4 = ellipseDist(uv, vec2(0.63, 0.63), vec2(0.22, 0.26));
        bg = blobOver(bg, vec3(0.831, 0.580, 0.451), 0.72 * smoothstep(0.82, 0.0, d4));
        float d3 = ellipseDist(uv, vec2(-0.01, 0.52), vec2(0.14, 0.42));
        bg = blobOver(bg, vec3(0.471, 0.667, 0.843), 0.38 * smoothstep(0.80, 0.0, d3));
        float d2 = ellipseDist(uv, vec2(0.32, 1.01), vec2(0.52, 0.14));
        bg = blobOver(bg, vec3(0.569, 0.706, 0.855), 0.55 * smoothstep(0.85, 0.0, d2));
        float d1 = ellipseDist(uv, vec2(0.06, 0.90), vec2(0.52, 0.58));
        bg = blobOver(bg, vec3(0.392, 0.608, 0.804), 0.82 * smoothstep(0.78, 0.0, d1));
      }

      if (u_gradientMode < 0.5 && u_grainAmount < 0.001) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
      }

      float timeStep = u_grainSpeed > 0.001
        ? floor(u_time * u_grainSpeed * 24.0) / 24.0
        : 0.0;

      vec2 grainUv = gl_FragCoord.xy / max(1.0, u_grainScale);
      float densityThresh = 1.0 - u_grainDensity;

      vec3 grainRgb;
      for (int ch = 0; ch < 3; ch++) {
        vec2 chOffset = vec2(float(ch) * 17.3, float(ch) * 31.1);
        float chTime = timeStep + float(ch) * 3.7;
        float n = grainNoise(grainUv + chOffset, chTime);
        n = smoothstep(densityThresh * 0.5, 1.0 - densityThresh * 0.3, n);
        float s = valueNoise((grainUv + chOffset) * 0.5 + chTime * 7.3);
        n = mix(n, s, u_grainSoftness);
        n = (n - 0.5) * u_grainContrast + 0.5 + u_grainBrightness;
        n = clamp(n, 0.0, 1.0);
        if (ch == 0) grainRgb.r = n;
        else if (ch == 1) grainRgb.g = n;
        else grainRgb.b = n;
      }

      vec3 color = applyBlend(bg, grainRgb, u_grainBlendMode);
      color = mix(bg, color, u_grainAmount);

      float alpha = u_grainAmount;

      if (u_gradientMode > 0.5) {
        gl_FragColor = vec4(color, 1.0);
      } else {
        gl_FragColor = vec4(color, alpha);
      }
    }
  `;

export { vertexSrc, fragmentSrc };
