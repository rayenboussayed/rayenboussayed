/**
 * GLSL shaders for glowing bubble material.
 * Fresnel rim + slow color drift. Keep low complexity for 60fps.
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
    // subtle vertex displacement
    vec3 pos = position;
    pos += normal * sin(uTime * 0.3 + length(position)) * 0.03;
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
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    float drift = sin(uTime * 0.2 + vUv.x * 3.0) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, drift);
    vec3 finalColor = color + fresnel * uGlow;
    gl_FragColor = vec4(finalColor, 0.88);
  }
`
