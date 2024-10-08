uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uDissipation;
uniform float uDisplacementStrength;

void main()
{
    vec2 uv = gl_FragCoord.xy/resolution.xy;

    vec4 color = texture(uGrid, uv - 0.011);
    float dist = distance(uPointer, uv);
    dist =  1.0 - (smoothstep(0.0, 0.18, dist));

    color.rg += uVelocity * dist * uDisplacementStrength;
    color.rg *= uDissipation;

    gl_FragColor = vec4(color.xyz, 1.0);
}