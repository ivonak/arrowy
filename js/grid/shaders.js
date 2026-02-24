window.GridShaders = (() => {
  const vertexSrc = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_contact;
    uniform vec2 u_dir;
    uniform vec3 u_dotColor;
    uniform float u_dotBaseOpacity;
    uniform float u_dotFinalOpacity;
    uniform float u_gridSpacing;
    uniform float u_dotSize;
    uniform float u_influenceRadius;
    uniform float u_shapeType;
    uniform float u_shapeStretchX;
    uniform float u_shapeStretchY;
    uniform float u_blobSeed;
    uniform float u_blobLobes;
    uniform float u_blobJaggedness;
    uniform float u_blobScale;
    uniform float u_ballRoundness;
    uniform float u_compressionStrength;
    uniform float u_dotSeparation;
    uniform float u_dotSharpness;
    uniform float u_grainAmount;
    uniform vec3 u_grainBackColor;
    uniform vec3 u_grainFrontColor;
    uniform float u_grainBackOpacity;
    uniform float u_grainFrontOpacity;
    uniform float u_grainBgMode;
    uniform float u_grainBlendMode;
    uniform float u_grainPresence;
    uniform float u_grainCoverage;
    uniform float u_grainBreakup;
    uniform float u_grainThreshold;
    uniform float u_grainContrast;
    uniform float u_grainLift;
    uniform float u_grainGamma;
    uniform float u_grainDither;
    uniform float u_grainBias;
    uniform float u_grainOffset;
    uniform float u_grainEdgeSoftness;
    uniform float u_grainIntensity;
    uniform float u_grainRadialFalloff;
    uniform float u_grainEdgeSteepness;
    uniform float u_grainDensityScale;
    uniform float u_grainFalloffOnset;
    const float TAU = 6.28318530718;

    float hash1(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    float hash12(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec2 hash2(vec2 p) {
      float n = sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123;
      float m = sin(dot(p, vec2(269.5, 183.3))) * 43758.5453123;
      return fract(vec2(n, m));
    }

    float polarNoise(float angle, float freq, float seed) {
      float t = angle / TAU * freq;
      float i = floor(t);
      float f = fract(t);
      f = f * f * (3.0 - 2.0 * f);
      return mix(hash1(mod(i, freq) + seed), hash1(mod(i + 1.0, freq) + seed), f);
    }

    vec3 applyBlendMode(vec3 base, vec3 blend, float mode) {
      if (mode < 0.5) return blend; // normal
      if (mode < 1.5) return 1.0 - (1.0 - base) * (1.0 - blend); // screen
      if (mode < 2.5) return min(base + blend, 1.0); // add
      return base * blend; // multiply
    }

    float shapeNorm(vec2 d, float radius) {
      vec2 sd = vec2(d.x / max(0.001, u_shapeStretchX), d.y / max(0.001, u_shapeStretchY));
      float base = length(sd) / max(1.0, radius);
      if (u_shapeType < 0.5) return base; // circle
      if (u_shapeType < 1.5) return base; // ellipse uses stretched sd
      if (u_shapeType < 2.5) {
        // Rounded-square-ish norm blend
        float sq = max(abs(sd.x), abs(sd.y)) / max(1.0, radius);
        return mix(base, sq, 0.72);
      }
      // Blob uses unstretched distance for organic shapes.
      float blobBase = length(d) / max(1.0, radius);
      float a = atan(d.y, d.x) + 3.14159265;
      float rough = clamp(u_blobJaggedness, 0.0, 1.0);
      float lobes = floor(max(2.0, u_blobLobes) + 0.5);
      float seed = fract(u_blobSeed * 0.0073) * 100.0;

      float n1 = polarNoise(a, lobes, seed);
      float n2 = polarNoise(a, lobes * 2.0, seed + 31.7);
      float n3 = polarNoise(a, lobes * 3.0, seed + 67.3);
      float contourWave = (n1 - 0.5) * 1.0
        + (n2 - 0.5) * 0.35 * rough
        + (n3 - 0.5) * 0.15 * rough * rough;

      float strength = mix(0.3, 0.9, rough);
      float contour = 1.0 + contourWave * strength;
      contour *= mix(1.0, max(0.2, u_blobScale), 0.9);
      return blobBase / max(0.25, contour);
    }

    vec2 deform(vec2 c, out float influence, out float frontness, out float dirness, out float shellProfile) {
      vec2 d = c - u_contact;
      float dist = length(d);
      float radius = max(1.0, u_influenceRadius);
      float nrm = shapeNorm(d, radius);
      influence = exp(-nrm * nrm * 2.0);
      float parallel = dot(d, u_dir);
      dirness = clamp(parallel / radius, -1.0, 1.0);
      frontness = parallel > 0.0 ? clamp(parallel / radius, 0.0, 1.0) : 0.0;
      float u = clamp(nrm, 0.0, 1.0);
      shellProfile = 4.0 * u * (1.0 - u);
      vec2 n = dist > 0.0001 ? d / dist : vec2(0.0, 0.0);
      float roundNudge = u_ballRoundness * influence * shellProfile * radius * 0.12;
      float gatherNudge = u_compressionStrength * influence * frontness * u_gridSpacing * 0.58;
      float sepDelta = u_dotSeparation - 1.0;
      float localSeparation = sepDelta * influence * u_gridSpacing * 0.75;
      return c + n * (roundNudge + localSeparation) + u_dir * gatherNudge;
    }

    void main() {
      vec2 p = gl_FragCoord.xy;
      float spacing = max(2.0, u_gridSpacing);
      vec2 cell = floor(p / spacing);

      float bestAlpha = 0.0;
      float sumInfluence = 0.0;
      float sumDirness = 0.0;

      for (int oy = -1; oy <= 1; oy++) {
        for (int ox = -1; ox <= 1; ox++) {
          vec2 c = (cell + vec2(float(ox), float(oy)) + 0.5) * spacing;
          float influence;
          float frontness;
          float dirness;
          float shellProfile;
          vec2 cd = deform(c, influence, frontness, dirness, shellProfile);
          sumInfluence += influence;
          sumDirness += dirness;
          float rimLift = u_ballRoundness * shellProfile * influence;
          float opacityCap = clamp(max(u_dotBaseOpacity, u_dotFinalOpacity), 0.05, 1.0);
          float alphaShape = influence * (0.18 + frontness * 0.22) + rimLift * 0.2;
          float alpha = clamp(u_dotBaseOpacity + alphaShape * opacityCap, 0.0, opacityCap);
          float size = u_dotSize + influence * (0.34 + frontness * 0.24) + rimLift * 0.16;
          float d = length(p - cd);
          float edgeSoft = clamp(1.05 / max(0.1, u_dotSharpness), 0.35, 1.6);
          float mask = 1.0 - smoothstep(size - edgeSoft, size + edgeSoft, d);
          float a = alpha * mask;
          bestAlpha = max(bestAlpha, a);

        }
      }

      // Extra stipple grain so the effect is clearly visible as particles.
      float avgInfluence = sumInfluence / 9.0;
      float avgDirness = sumDirness / 9.0;
      float radius = max(1.0, u_influenceRadius);
      vec2 grainCenter = u_contact + u_dir * (u_grainOffset * radius * 0.7);
      float shiftedInfluence = exp(-pow(shapeNorm(p - grainCenter, radius), 2.0) * u_grainRadialFalloff);
      float edgeStart = mix(0.22, 0.04, u_grainEdgeSoftness);
      float edgeEnd = mix(0.52, 0.86, u_grainEdgeSoftness);
      float ditherPower = clamp(u_grainDither, 0.0, 5.0);
      float coverage = clamp(u_grainCoverage, 0.5, 2.5);
      float breakup = clamp(u_grainBreakup, 0.0, 1.5);
      float thresholdGain = clamp(u_grainThreshold, 0.6, 1.2);
      float coverageN = (coverage - 0.5) / 2.0;
      float domainStart = mix(0.06, 0.015, u_grainEdgeSoftness);
      float domainEnd = mix(0.42, 0.22, u_grainEdgeSoftness);
      float grainDomainMask = smoothstep(domainStart, domainEnd, shiftedInfluence);
      float radialGrain = pow(shiftedInfluence, mix(1.55, 0.55, coverageN) * u_grainEdgeSteepness);
      float sideSignal = avgDirness * u_grainBias;
      float directionalGrain = mix(1.0, smoothstep(-0.2, 0.8, sideSignal), abs(u_grainBias));
      vec2 grainCoord = p + u_dir * (u_grainOffset * spacing * 0.55);
      float g1 = hash12(grainCoord * 0.73 + vec2(23.4, 17.9));
      float g2 = hash12(grainCoord * 1.91 + vec2(-11.1, 43.7));
      float g3 = hash12(grainCoord * 3.27 + vec2(57.2, -8.6));
      float grainRnd = (g1 * 0.52) + (g2 * 0.33) + (g3 * 0.15);
      float ditherNoise = (hash12(p * 0.67 + vec2(0.7, 2.1)) - 0.5)
        + (hash12(p * 1.41 + vec2(4.3, -1.7)) - 0.5) * 0.5;
      grainRnd = clamp(grainRnd + ditherNoise * ditherPower * 0.52, 0.0, 1.0);
      float grainDensity = clamp(radialGrain * directionalGrain, 0.0, 1.0);
      grainDensity = clamp(grainDensity * mix(0.78, 1.28, coverageN), 0.0, 1.0);
      float liftMask = smoothstep(edgeStart * 0.35, edgeEnd * 1.05, shiftedInfluence);
      grainDensity = mix(grainDensity, max(grainDensity, liftMask), clamp(u_grainLift * 0.78, 0.0, 1.0));
      grainDensity = clamp((grainDensity - 0.5) * u_grainContrast + 0.5, 0.0, 1.0);
      // Dither-driven breakup to avoid a solid center fill.
      float breakupNoise = (hash12(grainCoord * 2.43 + vec2(1.7, 8.9)) - 0.5)
        + (hash12(grainCoord * 4.31 + vec2(-6.4, 2.3)) - 0.5) * 0.65;
      grainDensity = clamp(grainDensity + breakupNoise * ditherPower * 0.18 * breakup, 0.0, 1.0);
      float centerSolid = smoothstep(0.68, 0.98, grainDensity);
      grainDensity *= (1.0 - centerSolid * clamp(ditherPower * 0.16 * breakup, 0.0, 0.85));
      grainDensity = pow(grainDensity, max(0.12, u_grainGamma));
      grainDensity *= u_grainDensityScale;
      float normDist = shapeNorm(p - grainCenter, radius);
      float blobEdge = sqrt(4.6 / max(0.5, u_grainRadialFalloff));
      float normalizedPos = clamp(normDist / blobEdge, 0.0, 1.0);
      grainDensity *= 1.0 - smoothstep(u_grainFalloffOnset, 1.0, normalizedPos);
      float threshold = 1.0 - clamp(grainDensity * (0.9 + ditherPower * 0.045) * thresholdGain, 0.0, 0.99);
      float width = mix(0.16, 0.03, clamp(u_grainContrast - 0.7, 0.0, 1.0)) + ditherPower * 0.028;
      float grainMask = smoothstep(threshold - width, threshold + width, grainRnd);
      float grainAlpha = grainMask * grainDensity * u_grainIntensity * u_grainAmount * clamp(u_grainPresence, 0.0, 2.0);
      grainAlpha *= grainDomainMask;

      float dotAlpha = clamp(bestAlpha, 0.0, 1.0);
      float grainFinalAlpha = clamp(grainAlpha, 0.0, 1.0);
      // Continuous centered split with no per-pixel perturbation to avoid seams/contours.
      float splitRadius = radius / max(0.7, sqrt(u_grainRadialFalloff * 0.5));
      float side = clamp(dot((p - grainCenter), u_dir) / max(1.0, splitRadius), -1.0, 1.0);
      float splitSoft = mix(0.42, 1.05, u_grainEdgeSoftness);
      float splitT = smoothstep(-splitSoft, splitSoft, side);
      vec3 grainBackLin = pow(max(u_grainBackColor, vec3(0.0)), vec3(2.2));
      vec3 grainFrontLin = pow(max(u_grainFrontColor, vec3(0.0)), vec3(2.2));
      float backWeight = (1.0 - splitT) * max(0.0, u_grainBackOpacity);
      float frontWeight = splitT * max(0.0, u_grainFrontOpacity);
      float totalWeight = backWeight + frontWeight;
      vec3 grainColorLin = totalWeight > 0.001
        ? (grainBackLin * backWeight + grainFrontLin * frontWeight) / totalWeight
        : grainBackLin;
      vec3 grainColor = pow(grainColorLin, vec3(1.0 / 2.2));

      float colorLuma = dot(grainColor, vec3(0.2126, 0.7152, 0.0722));
      float sideOpacity = totalWeight;
      float darkBoost = mix(1.75, 1.0, smoothstep(0.0, 0.82, colorLuma));
      float grainCombinedAlpha = clamp(grainFinalAlpha * sideOpacity * darkBoost, 0.0, 1.0);
      if (u_grainBgMode > 0.5) {
        grainCombinedAlpha *= mix(1.0, 2.1, smoothstep(0.72, 1.0, colorLuma));
      }
      grainCombinedAlpha = clamp(grainCombinedAlpha, 0.0, 1.0);

      vec3 grainBlend = applyBlendMode(u_dotColor, grainColor, u_grainBlendMode);
      vec3 grainPremul = grainBlend * grainCombinedAlpha;

      float outAlpha = dotAlpha + grainCombinedAlpha * (1.0 - dotAlpha);
      vec3 outPremul = (u_dotColor * dotAlpha) + grainPremul * (1.0 - dotAlpha);
      vec3 outColor = outAlpha > 0.0001 ? outPremul / outAlpha : vec3(0.0);
      if (u_grainBgMode > 0.5) {
        float whiteGlow = smoothstep(0.80, 1.0, colorLuma) * grainCombinedAlpha;
        outColor += grainColor * (whiteGlow * 0.16);
      }
      float ditherMask = max(dotAlpha * 0.9, grainDomainMask * 0.65);
      float bgDither = (hash12(p * 0.53 + vec2(3.1, 7.4)) - 0.5) * 0.007 * (0.35 + u_grainDither * 0.65) * ditherMask;
      outColor = clamp(outColor + vec3(bgDither), 0.0, 1.0);

      gl_FragColor = vec4(outColor, outAlpha);
    }
  `;

  return { vertexSrc, fragmentSrc };
})();
