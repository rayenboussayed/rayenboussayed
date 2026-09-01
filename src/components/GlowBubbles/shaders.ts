/**
 * GLSL shaders for glowing bubble material.
 * - Vertex: multi-frequency waving displacement (visible undulation)
 * - Fragment: Fresnel rim + faster color drift + iridescence + diffuse depth
 * Keep complexity low for 60fps (no loops, <20 ALU).
 */
export const bubbleVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = -mvPosition.xyz;
    vUv = uv;
    // visible waving: multi-sine combo ~0.28 max displacement
    vec3 pos = position;
    float w1 = sin(uTime * 0.9 + pos.y * 4.0) * 0.14;
    float w2 = sin(uTime * 0.7 + pos.x * 3.0) * 0.08;
    float w3 = sin(uTime * 0.5 + pos.z * 2.2 + length(pos) * 1.5) * 0.06;
    pos += normal * (w1 + w2 + w3);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const bubbleFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uGlow;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    // softer Fresnel rim so base color stays visible (was *1.6, now 0.9)
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.0) * 0.9;
    float drift = sin(uTime * 0.6 + vUv.x * 4.0 + length(vNormal) * 0.5) * 0.5 + 0.5;
    vec3 base = mix(uColorA, uColorB, drift);
    float irid = dot(n, vec3(0.6, 0.8, 0.4)) * 0.5 + 0.5;
    vec3 iridColor = vec3(1.0, 0.6, 0.9) * irid * 0.12;
    vec3 lightDir = normalize(vec3(0.8, 1.0, 0.6));
    float diffuse = max(dot(n, lightDir), 0.0) * 0.14;
    float spec = pow(max(dot(reflect(-lightDir, n), v), 0.0), 32.0) * 0.10;
    // keep base visible: rim is blended, not additive white wash
    vec3 rim = vec3(1.0, 0.95, 1.0) * fresnel * uGlow;
    vec3 finalColor = base * (0.88 + diffuse) + rim * 0.55 + iridColor + spec;
    float alpha = 0.65 + fresnel * 0.22;
    gl_FragColor = vec4(finalColor, alpha);
  }
`
