import { m4 } from "twgl.js";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { KeyFrame, Segment } from "./types";

interface Property {
    start: number;
    startTime: number;
    end: number;
    endTime: number;
}
export class WebGLRenderer {
    context: WebGLRenderingContext;
    program: WebGLProgram;

    positionLocation: number;
    texcoordLocation: number;

    matrixLocation: WebGLUniformLocation;
    textureLocation: WebGLUniformLocation;

    positionBuffer: WebGLBuffer;
    texcoordBuffer: WebGLBuffer;



    constructor(public canvas: HTMLCanvasElement, public projectWidth: number, public projectHeight: number) {
        // canvas.width = this.project.width;
        // canvas.height = this.project.height;
        this.context = canvas.getContext("webgl") as WebGLRenderingContext;
        if (!this.context) console.error("Failed to get webgl context!");

        // setup GLSL program
        this.program = this.context.createProgram() as WebGLProgram;

        this.context.attachShader(this.program, this.loadShader(VERTEX_SHADER, this.context.VERTEX_SHADER) as WebGLShader);
        this.context.attachShader(this.program, this.loadShader(FRAGMENT_SHADER, this.context.FRAGMENT_SHADER) as WebGLShader);

        this.context.linkProgram(this.program);
        const linked = this.context.getProgramParameter(this.program, this.context.LINK_STATUS);

        if (!linked) {
            console.error("Error in program linking:" + this.context.getProgramInfoLog(this.program));
            this.context.deleteProgram(this.program);
        }

        this.context.useProgram(this.program);

        // look up where the vertex data needs to go.
        this.positionLocation = this.context.getAttribLocation(this.program, "a_position");
        this.texcoordLocation = this.context.getAttribLocation(this.program, "a_texcoord");

        // lookup uniforms
        this.matrixLocation = this.context.getUniformLocation(this.program, "u_matrix") as WebGLUniformLocation;
        this.textureLocation = this.context.getUniformLocation(this.program, "u_texture") as WebGLUniformLocation;

        // Create a buffer to put three 2d clip space points in
        this.positionBuffer = this.context.createBuffer() as WebGLBuffer;
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionBuffer);
        // Put a unit quad in the buffer
        let positions = [
            0, 0,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 1,
        ]
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positions), this.context.STATIC_DRAW);

        // Create a buffer for texture coords
        this.texcoordBuffer = this.context.createBuffer() as WebGLBuffer;
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.texcoordBuffer);

        // Put texcoords in the buffer
        let texcoords = [
            0, 0,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 1,
        ]
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(texcoords), this.context.STATIC_DRAW);
    }

    public drawSegments(segments: Segment[], timestamp: number) {
        // Tell WebGL how to convert from clip space to pixels
        this.context.viewport(0, 0, this.projectWidth, this.projectHeight);
        this.context.clear(this.context.COLOR_BUFFER_BIT);

        for (const segment of segments) {
            this.drawImage(segment, this.calculateProperties(segment, timestamp));
        }

        this.context.flush();
    }

    private loadShader(shaderSource: string, shaderType: number) {
        // Create the shader object
        const shader = this.context.createShader(shaderType) as WebGLShader;

        // Load the shader source
        this.context.shaderSource(shader, shaderSource);

        // Compile the shader
        this.context.compileShader(shader);

        // Check the compile status
        const compiled = this.context.getShaderParameter(shader, this.context.COMPILE_STATUS);

        if (!compiled) {
            // Something went wrong during compilation; get the error
            const lastError = this.context.getShaderInfoLog(shader);

            console.error("*** Error compiling shader '" +
                shader +
                "':" +
                lastError +
                `\n` +
                shaderSource
                    .split("\n")
                    .map((l, i) => `${i + 1}: ${l}`)
                    .join("\n"));

            this.context.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // creates a texture info { width: w, height: h, texture: tex }
    // The texture will start with 1x1 pixels and be updated
    // when the image has loaded
    createTexture() {
        let tex = this.context.createTexture() as WebGLTexture;
        this.context.bindTexture(this.context.TEXTURE_2D, tex);
        // Fill the texture with a 1x1 blue pixel.
        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, 1, 1, 0, this.context.RGBA, this.context.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // let's assume all images are not a power of 2
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
        this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
        return tex;
    }

    private lerp(start: number, end: number, t: number) {
        return (end - start) * t + start;
    }

    private inverseLerp(value: number, start: number, end: number) {
        return Math.min(Math.max((value - start) / (end - start), 0), 1);
    }

    private updateProperty(obj: Property, value: number | undefined, timestamp: number) {
        if (value !== undefined) {
            obj.start = obj.end;
            obj.startTime = obj.endTime;
            obj.end = value;
            obj.endTime = timestamp;
        }
    }

    private calculateProperties(segment: Segment, timestamp: number): KeyFrame {
        timestamp -= segment.start;

        const PROPERTY_NAMES = ['x', 'y', 'scaleX', 'scaleY', 'trimLeft', 'trimRight', 'trimBottom', 'trimTop'];
        let properties = [];
        for (const property of PROPERTY_NAMES) {
            properties.push(
            {
                //@ts-ignore
                start: segment.keyframes[0][property] ?? 0,
                startTime: 0,
                //@ts-ignore
                end: segment.keyframes[0][property] ?? 0,
                endTime: 0
            }
            )
        }

        for (let i = 0; i < segment.keyframes.length; i++) {
            const frame = segment.keyframes[i];

            for (let j = 0; j < PROPERTY_NAMES.length; j++) {
                //@ts-ignore
                this.updateProperty(properties[j], frame[PROPERTY_NAMES[j]], frame.start);
                
            }
            if (frame.start > timestamp) break;
        }
        let output = {
            start: 0,   
        }
        for (let i = 0; i < PROPERTY_NAMES.length; i++) {
            //@ts-ignore
            output[PROPERTY_NAMES[i]] = this.lerp(properties[i].start, properties[i].end, this.inverseLerp(timestamp, properties[i].startTime, properties[i].endTime));
            
        }
        return output;
    }

    // Unlike images, textures do not have a width and height associated
    // with them so we'll pass in the width and height of the texture
    private drawImage(segment: Segment, properties: KeyFrame) {
        this.context.bindTexture(this.context.TEXTURE_2D, segment.texture);
        this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, segment.media.element);

        // Tell WebGL to use our shader program pair
        this.context.useProgram(this.program);

        // Setup the attributes to pull data from our buffers
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionBuffer);
        this.context.enableVertexAttribArray(this.positionLocation);
        this.context.vertexAttribPointer(this.positionLocation, 2, this.context.FLOAT, false, 0, 0);

        // Begin Crop
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.texcoordBuffer);

        // Put texcoords in the buffer
        let texcoords = [
            0 + (properties.trimLeft as number), 0 + (properties.trimTop as number),
            1 - (properties.trimRight as number), 1 - (properties.trimBottom as number),
            1 - (properties.trimRight as number), 0 + (properties.trimTop as number),
            0 + (properties.trimLeft as number), 0 + (properties.trimTop as number),
            0 + (properties.trimLeft as number), 1 - (properties.trimBottom as number),
            1 - (properties.trimRight as number), 1 - (properties.trimBottom as number),
        ]
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(texcoords), this.context.STATIC_DRAW);
        // End Crop

        this.context.enableVertexAttribArray(this.texcoordLocation);
        this.context.vertexAttribPointer(this.texcoordLocation, 2, this.context.FLOAT, false, 0, 0);

        // this matirx will convert from pixels to clip space
        let matrix = m4.ortho(0, this.context.canvas.width, this.context.canvas.height, 0, -1, 1);

        let newWidth = segment.media.element.videoWidth * (properties.scaleX as number);
        let newHeight = segment.media.element.videoHeight * (properties.scaleY as number);

        // this matrix will translate our quad to dstX, dstY
        
        matrix = m4.translate(matrix, [
            (this.projectWidth / 2) + ((properties.x as number) - (newWidth / 2)) + newWidth*(properties.trimLeft as number),
            (this.projectHeight / 2) + ((properties.y as number) - (newHeight / 2)) + newHeight*(properties.trimTop as number), 0, 0]);

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = m4.scale(matrix, [newWidth*( 1 - (properties.trimRight as number) - (properties.trimLeft as number)),
             newHeight*( 1 - (properties.trimTop as number) - (properties.trimBottom as number)), 0, 0]);

        // Set the matrix.
        this.context.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Tell the shader to get the texture from texture unit 0
        this.context.uniform1i(this.textureLocation, 0);

        // draw the quad (2 triangles, 6 vertices)
        this.context.drawArrays(this.context.TRIANGLES, 0, 6);
    }
}
