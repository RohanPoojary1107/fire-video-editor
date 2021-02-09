export let VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main() {
       // convert the rectangle from pixels to 0.0 to 1.0
       vec2 zeroToOne = a_position / u_resolution;

       // convert from 0->1 to 0->2
       vec2 zeroToTwo = zeroToOne * 2.0;

       // convert from 0->2 to -1->+1 (clipspace)
       vec2 clipSpace = zeroToTwo - 1.0;

       gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

       // pass the texCoord to the fragment shader
       // The GPU will interpolate this value between points.
       v_texCoord = a_texCoord;
    }
`;

export let FRAGMENT_SHADER = `
    precision mediump float;
    ()
    // our textures
    uniform sampler2D u_image0;
    uniform sampler2D u_image1;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
       vec4 color0 = texture2D(u_image0, v_texCoord);
       vec4 color1 = texture2D(u_image1, v_texCoord);
       gl_FragColor = color0 * color1;
    }
`;