export interface Media {
    element: HTMLVideoElement;
    file: File;
    thumbnail: string;
}

export interface Segment {
    media: Media;
    start: number;
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[];
    texture: WebGLTexture;
}

export interface KeyFrame {
    start: number;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
}

