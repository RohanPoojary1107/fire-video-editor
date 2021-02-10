import { Segment, Project } from "./types";
import { WebGLRenderer } from "./webgl";

export class Model {
    renderer: WebGLRenderer;
    thumbnailCanvas: HTMLCanvasElement;
    thumbnailCanvasContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    project: Project;

    constructor() {
        this.canvas = document.createElement("canvas");
        this.project = { name: "test", media: [], segments: [], width: 1920, height: 1080, framerate: 30, currTimestamp: 0, duration: 0 };
        this.renderer = new WebGLRenderer(this.canvas, this.project);
        this.thumbnailCanvas = document.createElement("canvas");
        this.thumbnailCanvasContext = this.thumbnailCanvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public async addVideo(file: File) {
        let elm = document.createElement("video") as HTMLVideoElement;

        await new Promise<void>((resolve, reject) => {
            elm.onloadeddata = () => resolve();
            elm.src = URL.createObjectURL(file);
        });

        // Generate Thumbnail
        this.thumbnailCanvas.width = elm.videoWidth;
        this.thumbnailCanvas.height = elm.videoHeight;
        this.thumbnailCanvasContext.drawImage(elm, 0, 0);

        let media = {
            element: elm,
            file: file,
            thumbnail: this.thumbnailCanvas.toDataURL(),
            texture: this.renderer.createTexture()
        };

        let segment: Segment = {
            media: media,
            start: 0,
            duration: 0,
            mediaStart: 0,
            keyframes: [],
            properties: {
                x: 0,
                y: 0,
                width: elm.videoWidth,
                height: elm.videoHeight,
            },
        }

        this.project.media.push(media);
        this.project.segments.push(segment);
        console.log("Sucessfully Loaded Segment Thumbnail!");
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

