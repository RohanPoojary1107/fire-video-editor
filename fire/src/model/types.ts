export interface Media {
    element: HTMLVideoElement;
}

export interface Segment {
    media: Media;
    start: number;
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[];
    texture: WebGLTexture;
    properties: Properties;
}

export interface KeyFrame {
    start: number;
    properties: Properties;
}

export interface Properties {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Project {
    name: string;
    width: number;
    height: number;
    framerate: number;
    media: Segment[];
    currTimestamp: number;
    duration: number; // in seconds
}