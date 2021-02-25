import styles from "./mediaPlayer.module.css";
import { useEffect, useRef, useState } from "react";
import PlaybackController from "./playbackController";
import { Media, Segment } from "./types";
import { WebGLRenderer } from "./webgl";

export default function MediaManager(props: {}) {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [segmentList, setSegmentList] = useState<Segment[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [projectWidth, setProjectWidth] = useState<number>(0);
    const [projectHeight, setProjectHeight] = useState<number>(0);
    const [projectFramerate, setProjectFrameRate] = useState<number>(0);
    const [projectDuration, setProjectDuration] = useState<number>(0);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    const canvas = document.createElement("canvas");
    const renderer = new WebGLRenderer(canvas);
    const thumbnailCanvas = document.createElement("canvas");
    const thumbnailCanvasContext = thumbnailCanvas.getContext("2d") as CanvasRenderingContext2D;

    const addVideo = async (file: File) => {
        let elm = document.createElement("video") as HTMLVideoElement;

        await new Promise<void>((resolve, reject) => {
            elm.onloadeddata = () => resolve();
            elm.src = URL.createObjectURL(file);
            elm.currentTime = 0.0001;
        });

        // Generate Thumbnail
        thumbnailCanvas.width = elm.videoWidth;
        thumbnailCanvas.height = elm.videoHeight;
        thumbnailCanvasContext.drawImage(elm, 0, 0, elm.videoWidth, elm.videoHeight);

        let media: Media = {
            element: elm,
            file: file,
            thumbnail: thumbnailCanvas.toDataURL(),
        };

        setMediaList([...mediaList, media]);

        console.log("Sucessfully Loaded Segment Thumbnail!");
    }

    const dragAndDrop = (timestamp: number, media: Media) => {
        let segment: Segment = {
            media: media,
            start: timestamp,
            duration: media.element.duration,
            mediaStart: 0,
            texture: renderer.createTexture(),
            keyframes: [{
                start: 0,
                x: 0,
                y: 0,
                width: projectWidth,
                height: projectHeight,
            }],
        }

        setSegmentList([...segmentList, segment]);
    }

    const deleteVideo = (media: Media) => {
        setMediaList(mediaList.filter(item => item !== media));
        setSegmentList(segmentList.filter(item => item.media !== media));
    }

    return (
        <PlaybackController {...props}
            mediaList={mediaList}
            setMediaList={setMediaList}
            segmentList={segmentList}
            setSegmentList={setSegmentList}
        />
    );
}
