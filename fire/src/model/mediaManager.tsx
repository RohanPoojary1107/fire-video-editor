import { useEffect, useRef, useState } from "react";
import PlaybackController from "./playbackController";
import { Media, Segment } from "./types";
import { WebGLRenderer } from "./webgl";

export default function MediaManager(props: {}) {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [trackList, setTrackList] = useState<Segment[][]>([[]]);
    const [projectName, setProjectName] = useState<string>("");
    const [projectWidth, setProjectWidth] = useState<number>(1920);
    const [projectHeight, setProjectHeight] = useState<number>(1080);
    const [projectFramerate, setProjectFrameRate] = useState<number>(30);
    const [projectDuration, setProjectDuration] = useState<number>(0);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(document.createElement("canvas"));
    const [renderer, setRenderer] = useState<WebGLRenderer>(new WebGLRenderer(canvasRef, projectWidth, projectHeight));

    useEffect(() => {
        canvasRef.width = projectWidth;
        canvasRef.height = projectHeight;
    }, [canvasRef, projectHeight, projectWidth]);

    const thumbnailCanvas = document.createElement("canvas");
    const thumbnailCanvasContext = thumbnailCanvas.getContext("2d") as CanvasRenderingContext2D;

    const addVideo = async (file: File) => {
        let elm = document.createElement("video") as HTMLVideoElement;
        elm.preload = "auto";

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

    const dragAndDrop = (timestamp: number, media: Media, trackNum: number) => {
        let segment: Segment = {
            media: media,
            start: timestamp,
            duration: media.element.duration * 1000 - 1000,
            mediaStart: 1000,
            texture: renderer.createTexture(),
            keyframes: [{
                start: 1000,
                x: 0,
                y: 0,
                width: projectWidth,
                height: projectHeight,
            }],
        }

        setTrackList([...trackList.slice(0, trackNum), [...trackList[trackNum], segment], ...trackList.slice(trackNum + 1)]);
        setProjectDuration(Math.max(projectDuration, segment.start + segment.duration));
    }

    const deleteVideo = (media: Media) => {
        setMediaList(mediaList.filter((item: Media) => {
            if (item !== media) media.element.pause();
            return item !== media;
        }));

        let projectDuration = 0;
        setTrackList(trackList.map((track) => track.filter((segment: Segment) => {
            if (segment.media !== media) projectDuration = Math.max(projectDuration, segment.start + segment.duration);
            return segment.media !== media;
        })));
        setProjectDuration(projectDuration);
    }

    return (
        <PlaybackController {...props}
            canvasRef={canvasRef}
            mediaList={mediaList}
            setMediaList={setMediaList}
            trackList={trackList}
            setTrackList={setTrackList}
            addVideo={addVideo}
            deleteVideo={deleteVideo}
            projectWidth={projectWidth}
            projectHeight={projectHeight}
            renderer={renderer}
            projectFrameRate={projectFramerate}
            dragAndDrop={dragAndDrop}
            projectDuration={projectDuration}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
        />
    );
}
