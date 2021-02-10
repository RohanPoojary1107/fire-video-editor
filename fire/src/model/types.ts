export interface Media {
    element: HTMLVideoElement;
    file: File;
    thumbnail: string;
    texture: WebGLTexture;
}

export interface Segment {
    media: Media;
    start: number;
    duration: number;
    mediaStart: number;
    keyframes: KeyFrame[];
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
    media: Media[];
    segments: Segment[];
    currTimestamp: number;
    duration: number; // in seconds
}