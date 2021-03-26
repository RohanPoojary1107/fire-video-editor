export interface Source {
    track: number;
    element: HTMLVideoElement;
    inUse: boolean;
}
export interface Media {
    sources: Source[]; // Source 0 should allways be present
    file: File;
    thumbnail: string;
}

export interface Segment {
    media: Media;
    start: number; // Global start
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[]; // Keyframe 0 should allways be present
    texture: WebGLTexture;
}

export interface KeyFrame {
    start: number; // Offset from segment start
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    trimLeft?: number;
    trimRight?: number
    trimTop?: number;
    trimBottom?: number;
}

export interface SegmentID {
    index: number;
    track: number;
}


export interface Project {
    _id: string;
    name: string;
    width: number;
    height: number;
    framerate: number;
    duration: number;
}