export interface Media {
    element: HTMLVideoElement;
    file: File;
    thumbnail: string;
}

export interface Segment {
    media: Media;
    start: number; // Global start
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[];
    texture: WebGLTexture;
    track: number;
}

export interface KeyFrame {
    start: number; // Offset from segment start
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
}

export interface SegmentID {
    index: number;
    track: number;
}

