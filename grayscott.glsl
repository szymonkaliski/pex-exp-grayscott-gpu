#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;

attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;

uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D source;

uniform float delta;
uniform float feed;
uniform float kill;

uniform vec2 brush;
uniform float brushSize;

vec2 texel = vec2(1.0 / screenWidth, 1.0 / screenHeight);
float step_x = 1.0 / screenWidth;
float step_y = 1.0 / screenHeight;

void main() {
  if (brush.x < -5.0) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    return;
  }

  vec2 uv = texture2D(source, vTexCoord).rg;
  vec2 uv0 = texture2D(source, vTexCoord + vec2(-step_x, 0.0)).rg;
  vec2 uv1 = texture2D(source, vTexCoord + vec2(step_x, 0.0)).rg;
  vec2 uv2 = texture2D(source, vTexCoord + vec2(0.0, -step_y)).rg;
  vec2 uv3 = texture2D(source, vTexCoord + vec2(0.0, step_y)).rg;

  vec2 lapl = (uv0 + uv1 + uv2 + uv3 - 4.0 * uv);
  float du = 0.2097 * lapl.r - uv.r * uv.g * uv.g + feed * (1.0 - uv.r);
  float dv = 0.105 * lapl.g + uv.r * uv.g * uv.g - (feed + kill) * uv.g;
  vec2 dst = uv + delta * vec2(du, dv);

  if (brush.x > 0.0) {
    vec2 diff = (vTexCoord - brush) / texel;
    float dist = dot(diff, diff);
    if (dist < brushSize) { dst.g = 0.9; }
  }

  gl_FragColor = vec4(dst.r, dst.g, 0.0, 1.0);
}

#endif
