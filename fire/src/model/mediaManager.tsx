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

    const generateThumbnail = async (file: File) => {
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
        thumbnailCanvasContext.drawImage(
            elm,
            0,
            0,
            elm.videoWidth,
            elm.videoHeight
        );

        let media: Media = {
            element: elm,
            file: file,
            thumbnail: thumbnailCanvas.toDataURL(),
        };

        return media;
    };

    const addVideo = async (files: File[]) => {
        let uniqueFiles: File[] = [];
        let found = false;
        for (let file of files) {
            for (let i = 0; i < mediaList.length; i++) {
                if (mediaList[i].file.name === file.name) {
                    found = true;
                    break;
                }
            }
            if (found) continue;
            uniqueFiles.push(file);
        }

        let filesList: Media[] = [];

        for (let file of uniqueFiles) {
            filesList.push(await generateThumbnail(file));
        }

        setMediaList([...mediaList, ...filesList]);

        console.log("Sucessfully Loaded Segment Thumbnail!");
        return;
    }

    const dragAndDrop = (timestamp: number, media: Media, trackNum: number) => {
        if (renderer == null) return;
        let segment: Segment = {
            media: media,
            start: timestamp,
            duration: media.element.duration * 1000,
            mediaStart: 0,
            texture: renderer.createTexture(),
            keyframes: [
                {
                    start: 0,
                    x: 0,
                    y: 0,
                    scaleX: 1.0,
                    scaleY: 1.0,
                },
            ],
        };

        setTrackList([
            ...trackList.slice(0, trackNum),
            [...trackList[trackNum], segment],
            ...trackList.slice(trackNum + 1),
        ]);
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
            if (segment == selectedSegment) setSelectedSegment(null);
            return segment.media !== media;
        })));
        setProjectDuration(projectDuration);
    }

    const deleteSelectedSegment = () => {
        if (selectedSegment !== null) {
            let projectDuration = 0;
            setTrackList(trackList.map((track) => track.filter((segment: Segment) => {
                if (segment !== selectedSegment) projectDuration = Math.max(projectDuration, segment.start + segment.duration);
                if (segment === selectedSegment) segment.media.element.pause();
                return segment !== selectedSegment;
            })));
            setProjectDuration(projectDuration);
            setSelectedSegment(null);
        }
    }

    const updateSegment = (oldSeg: Segment, newSegment: Segment) => {
        setTrackList(trackList.map((track) => track.map((segment: Segment) => {
            return segment === oldSeg ? newSegment : segment;
        })));

        if (oldSeg === selectedSegment) setSelectedSegment(newSegment);
    }

    return (
        <PlaybackController
            {...props}
            canvasRef={canvasRef}
            mediaList={mediaList}
            setMediaList={setMediaList}
            trackList={trackList}
            setTrackList={setTrackList}
            addVideo={addVideo}
            deleteVideo={deleteVideo}
            deleteSelectedSegment={deleteSelectedSegment}
            projectWidth={projectWidth}
            projectHeight={projectHeight}
            renderer={renderer}
            projectDuration={projectDuration}
            projectFrameRate={projectFramerate}
            dragAndDrop={dragAndDrop}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            updateSegment={updateSegment}
        />
    );
}
