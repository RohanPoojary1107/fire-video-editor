import { Segment, Project } from "./types";
import { WebGLRenderer } from "./webgl";

export class Model {
    renderer: WebGLRenderer;

    constructor(public canvas: HTMLCanvasElement, public project: Project) {
        this.project = { name: "test", media: [], width: 1920, height: 1080, framerate: 30, currTimestamp: 0, duration: 0 };
        this.renderer = new WebGLRenderer(canvas, project);
    }

    public addVideo(element: HTMLVideoElement) {
        let segment: Segment = {
            media: { element: element },
            start: 0,
            duration: 0,
            mediaStart: 0,
            keyframes: [],
            texture: this.renderer.createTexture(),
            properties: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }

        this.project.media.push(segment);
        this.renderer.loadFrame(segment).then(() => {
            console.log("Sucessfully Loaded Segment Start!");
        })
    }

    public async seek(timestamp: number) {

    }

    private async seekVideos() {
        
    }

    private updateProperties() {

    }

    private renderFrame() {

    }
}

