/**
 * Stripe-Style Animated Gradient Background
 *
 * A premium WebGL shader-based background inspired by Stripe's homepage.
 * Features smooth multi-color gradients with fluid motion and depth.
 *
 * Technical Implementation:
 * - WebGL 2.0 fragment shader with simplex noise
 * - GSAP for smooth uniform animations
 * - Time-based UV distortion for organic motion
 * - GPU-optimized with efficient color blending
 *
 * Color Math:
 * - Uses HSL color space for smooth transitions
 * - Perlin-style noise for organic gradient flow
 * - Multiple octaves for depth and detail
 * - Soft color stops with cosine interpolation
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================
// GLSL SHADER CODE
// ============================================

const vertexShader = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scrollProgress;
uniform float u_colorShift;
uniform float u_noiseScale;
uniform float u_flowSpeed;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_mouseVelocity; // New uniform for velocity-based intensity

// ============================================
// SIMPLEX NOISE IMPLEMENTATION
// ============================================

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ============================================
// FRACTAL BROWNIAN MOTION (FBM)
// Multiple octaves for depth and detail
// ============================================

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// ============================================
// COLOR PALETTE - Stripe-inspired
// Uses cosine gradients for smooth blending
// ============================================

vec3 palette(float t, float shift) {
  // Stripe-style colors: purple, blue, cyan, pink, orange
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263 + shift * 0.1, 0.416 + shift * 0.05, 0.557 + shift * 0.15);
  
  return a + b * cos(6.28318 * (c * t + d));
}

// Premium color stops
vec3 getGradientColor(float t, float shift) {
  // Define premium color stops
  vec3 purple = vec3(0.478, 0.278, 0.792);   // #7A47CA
  vec3 blue = vec3(0.282, 0.439, 0.918);     // #4870EA
  vec3 cyan = vec3(0.286, 0.706, 0.788);     // #49B4C9
  vec3 pink = vec3(0.847, 0.369, 0.569);     // #D85E91
  vec3 orange = vec3(0.945, 0.569, 0.337);   // #F19156
  vec3 violet = vec3(0.569, 0.329, 0.847);   // #9154D8
  
  // Shift the t value based on uniform
  t = fract(t + shift * 0.2);
  
  // Smooth interpolation between colors
  float segment = t * 5.0;
  int idx = int(floor(segment));
  float f = fract(segment);
  
  // Smooth step for soft transitions
  f = f * f * (3.0 - 2.0 * f);
  
  vec3 color;
  if(idx == 0) color = mix(purple, blue, f);
  else if(idx == 1) color = mix(blue, cyan, f);
  else if(idx == 2) color = mix(cyan, pink, f);
  else if(idx == 3) color = mix(pink, orange, f);
  else color = mix(orange, violet, f);
  
  return color;
}

// ============================================
// MAIN SHADER LOGIC
// ============================================

// HSB to RGB Conversion for maximum vibrancy
vec3 hsb2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = v_uv;
  // Aspect ratio correction for geometry and distance
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  
  // Diagonal flow direction
  vec2 flowDir = normalize(vec2(1.0, 0.7));
  
  // Time-based animation
  float time = u_time * u_flowSpeed; 
  
  // Mouse interaction
  vec2 mousePos = u_mouse;
  
  // Correct distance calculation to be circular (aspect corrected)
  float mouseDist = length((uv - mousePos) * aspect);
  
  // Velocity-based opacity for interaction
  // If velocity is high, effect is visible. If 0, it fades out.
  float velocityFactor = smoothstep(0.0, 0.02, u_mouseVelocity);
  
  // Bigger radius (0.5) for broader influence
  // Smoother falloff
  float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * velocityFactor;
  
  // UV distortion - Broad, subtle push
  vec2 distortedUV = uv * aspect;
  
  // Gentle push away from mouse
  // Intensity increased to 1.8 for better visibility
  distortedUV -= (uv - mousePos) * mouseInfluence * 1.8; 
  
  // noise layers
  float noise1 = fbm(vec3(distortedUV * u_noiseScale, time * 0.4), 5);
  float noise2 = fbm(vec3(distortedUV * u_noiseScale * 0.4 + 100.0, time * 0.25), 4);
  float noise3 = fbm(vec3(distortedUV * u_noiseScale * 1.8 + 200.0, time * 0.6), 3);
  
  // Combine noise
  float combinedNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
  
  // Apply diagonal flow
  float flowValue = dot(uv, flowDir) + combinedNoise * 0.4;
  flowValue += u_scrollProgress * 0.25;
  
  // Subtle mouse-based hue shift
  // Increased intensity to 0.9 for better visibility
  flowValue += mouseInfluence * 0.9;
  
  // Generate colors
  float hueBase = fract(flowValue * 0.15 + u_colorShift);
  float restrictedHue = 0.5 + hueBase * 0.4; 
  vec3 hsb = vec3(restrictedHue, 1.0, 0.85);
  vec3 color = hsb2rgb(hsb);
  
  // Contrast/Brightness
  color = (color - 0.5) * (u_contrast + 0.4) + 0.5;
  color *= u_brightness;
  
  // Vignette
  float vignette = 1.0 - length((uv - 0.5) * 1.1);
  vignette = smoothstep(0.0, 1.0, vignette);
  color *= 0.6 + vignette * 0.4; 
  
  fragColor = vec4(color, 1.0);
}
`;

// ============================================
// WEBGL UTILITIES
// ============================================

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertShader || !fragShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

// ============================================
// REACT COMPONENT
// ============================================

const StripeGradientBackground = ({
  className = "",
  style = {},
  intensity = 1,
  speed = 0.3,
  colorShift = 0,
  blur = false,
  overlay = true,
  overlayOpacity = 0.02,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef({});
  const startTimeRef = useRef(Date.now());
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Shader uniform values (animated by GSAP)
  const shaderValues = useRef({
    time: 0,
    scrollProgress: 0,
    colorShift: colorShift,
    noiseScale: 0.75,
    flowSpeed: speed * 0.5,
    brightness: 1.0,
    contrast: 1.2,
    mouseX: 0.5,
    mouseY: 0.5,
    lastMouseX: 0.5,
    lastMouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    velocity: 0,
  });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      console.warn("WebGL 2 not supported, falling back to CSS gradient");
      return false;
    }

    glRef.current = gl;

    // Create shader program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;
    gl.useProgram(program);

    // Get uniform locations
    uniformsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      scrollProgress: gl.getUniformLocation(program, "u_scrollProgress"),
      colorShift: gl.getUniformLocation(program, "u_colorShift"),
      noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
      flowSpeed: gl.getUniformLocation(program, "u_flowSpeed"),
      brightness: gl.getUniformLocation(program, "u_brightness"),
      contrast: gl.getUniformLocation(program, "u_contrast"),
      mouseVelocity: gl.getUniformLocation(program, "u_mouseVelocity"),
    };

    // Create fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    return true;
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);
  }, []);

  // Render frame
  const render = useCallback(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !uniforms.time) return;

    const canvas = canvasRef.current;
    if (!canvas) return; // Fix for "canvas is null" error on page switch

    // Update time uniform
    if (!prefersReducedMotion) {
      shaderValues.current.time = (Date.now() - startTimeRef.current) / 1000;
    }

    // Smooth mouse lerping
    const lerpFactor = 0.05; // Very smooth / laggy following
    const vLerpFactor = 0.1; // Velocity smoothness

    // Update Pos
    shaderValues.current.mouseX += (shaderValues.current.targetMouseX - shaderValues.current.mouseX) * lerpFactor;
    shaderValues.current.mouseY += (shaderValues.current.targetMouseY - shaderValues.current.mouseY) * lerpFactor;

    // Calculate Velocity
    const dx = shaderValues.current.mouseX - shaderValues.current.lastMouseX;
    const dy = shaderValues.current.mouseY - shaderValues.current.lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Smooth opacity based on movement speed (amplified so small moves register)
    const targetVelocity = Math.min(dist * 60.0, 1.0);
    shaderValues.current.velocity += (targetVelocity - shaderValues.current.velocity) * vLerpFactor;

    // Update last pos
    shaderValues.current.lastMouseX = shaderValues.current.mouseX;
    shaderValues.current.lastMouseY = shaderValues.current.mouseY;

    // Set uniforms
    gl.uniform1f(uniforms.time, shaderValues.current.time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.mouse, shaderValues.current.mouseX, shaderValues.current.mouseY);
    gl.uniform1f(uniforms.scrollProgress, shaderValues.current.scrollProgress);
    gl.uniform1f(uniforms.colorShift, shaderValues.current.colorShift);
    gl.uniform1f(
      uniforms.noiseScale,
      shaderValues.current.noiseScale * intensity
    );
    gl.uniform1f(uniforms.flowSpeed, shaderValues.current.flowSpeed);
    gl.uniform1f(uniforms.brightness, shaderValues.current.brightness);
    gl.uniform1f(uniforms.contrast, shaderValues.current.contrast);
    gl.uniform1f(uniforms.mouseVelocity, shaderValues.current.velocity);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Continue animation loop
    animationRef.current = requestAnimationFrame(render);
  }, [intensity, prefersReducedMotion]);

  // Initialize effect
  useEffect(() => {
    const success = initWebGL();
    if (!success) return;

    setIsReady(true);
    handleResize();

    // Start render loop
    render();

    // Resize listener
    window.addEventListener("resize", handleResize);

    // Mouse move listener for shader interaction
    const handleMouseMove = (e) => {
      if (shaderValues.current) {
        shaderValues.current.targetMouseX = e.clientX / window.innerWidth;
        shaderValues.current.targetMouseY = 1.0 - (e.clientY / window.innerHeight); // Invert Y for shader coords
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // GSAP animations for smooth uniform changes
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        shaderValues.current,
        { brightness: 0, noiseScale: 0.4 },
        {
          brightness: 1.0,
          noiseScale: 0.75,
          duration: 3,
          ease: "expo.out",
        }
      );

      // Subtle color shift animation
      gsap.to(shaderValues.current, {
        colorShift: 1,
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll-based animation (very subtle)
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          if (shaderValues.current) {
            shaderValues.current.scrollProgress = self.progress;
          }
        },
      });
    });

    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      ctx.revert();

      // Cleanup WebGL
      const gl = glRef.current;
      if (gl && programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, [initWebGL, handleResize, render]);

  // Update colorShift prop
  useEffect(() => {
    gsap.to(shaderValues.current, {
      colorShift: colorShift,
      duration: 1,
      ease: "power2.out",
    });
  }, [colorShift]);

  return (
    <div
      className={`stripe-gradient-bg ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          filter: blur ? "blur(30px)" : "none",
          transform: blur ? "scale(1.1)" : "none",
        }}
      />

      {/* Fallback CSS gradient (if WebGL fails) */}
      {!isReady && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `
              linear-gradient(
                135deg,
                rgba(122, 71, 202, 0.8) 0%,
                rgba(72, 112, 234, 0.8) 25%,
                rgba(73, 180, 201, 0.8) 50%,
                rgba(216, 94, 145, 0.8) 75%,
                rgba(241, 145, 86, 0.8) 100%
              )
            `,
          }}
        />
      )}

      {/* Removed noise overlay per request */}

      {/* Removed overlay per request to ensure maximum vibrancy */}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(0, 0, 0, 0.05) 100%
            )
          `,
          pointerEvents: "none",
        }}
      />

      {/* Styles */}
      <style>{`
        .stripe-gradient-bg canvas {
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
        }

        @media (prefers-reduced-motion: reduce) {
          .stripe-gradient-bg canvas {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StripeGradientBackground;
