import { Segment, Project } from "./types";
import { WebGLRenderer } from "./webgl";

const model = new class Model {
    renderer: WebGLRenderer;
    thumbnailCanvas: HTMLCanvasElement;
    thumbnailCanvasContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    project: Project;
    playing: boolean = false;
    currTimestamp: number = 0;
    timeout: number = 0;

    constructor() {
        this.canvas = document.createElement("canvas");
        this.project = { name: "test", media: [], segments: [], width: 1920, height: 1080, framerate: 30, duration: 0 };
        this.renderer = new WebGLRenderer(this.canvas, this.project);
        this.thumbnailCanvas = document.createElement("canvas");
        this.thumbnailCanvasContext = this.thumbnailCanvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public async addVideo(file: File) {
        let elm = document.createElement("video") as HTMLVideoElement;

        await new Promise<void>((resolve, reject) => {
            elm.onloadeddata = () => resolve();
            elm.src = URL.createObjectURL(file);
            elm.currentTime = 0.0001;
        });

        // Generate Thumbnail
        this.thumbnailCanvas.width = elm.videoWidth;
        this.thumbnailCanvas.height = elm.videoHeight;
        this.thumbnailCanvasContext.drawImage(elm, 0, 0, elm.videoWidth, elm.videoHeight);

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
                x: this.project.media.length % 2 * this.project.width / 2,
                y: Math.floor(this.project.media.length / 2) * this.project.height / 2,
                width: elm.videoWidth / 2,
                height: elm.videoHeight / 2,
            },
        }

        this.project.media.push(media);
        this.project.segments.push(segment);
        console.log("Sucessfully Loaded Segment Thumbnail!");
    }

    public async seek(timestamp: number) {

    }

    public play() {
        if (this.project.media.length === 0) return;

        this.playing = true;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => { this.renderFrame(); }, 1 / this.project.framerate) as unknown as number;
        for (const media of this.project.media) {
            media.element.play();
        }
    }

    public pause() {
        this.playing = false;
        clearTimeout(this.timeout);
        for (const media of this.project.media) {
            media.element.pause();
        }
    }

    private renderFrame() {
        this.renderer.drawMedia(this.project.segments);
        this.timeout = setTimeout(() => { this.renderFrame(); }, 1 / this.project.framerate) as unknown as number;
    }
}();

export default model;


