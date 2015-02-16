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

uniform vec4 color1;
uniform vec4 color2;

vec2 texel = vec2(1.0 / screenWidth, 1.0 / screenHeight);

void main() {
  float value = texture2D(source, vTexCoord).g;
  vec3 col = mix(color1.rgb, color2.rgb, value);

  gl_FragColor = vec4(col.r, col.g, col.b, 1.0);
}

#endif
