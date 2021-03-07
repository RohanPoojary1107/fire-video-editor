import { useEffect, useRef, useState } from "react";
import PlaybackController from "./playbackController";
import { Media, Segment, SegmentID } from "./types";
import { WebGLRenderer } from "./webgl";

export default function MediaManager(props: {}) {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [trackList, setTrackList] = useState<Segment[][]>([[]]);
    const [projectName, setProjectName] = useState<string>("");
    const [projectWidth, setProjectWidth] = useState<number>(1920);
    const [projectHeight, setProjectHeight] = useState<number>(1080);
    const [projectFramerate, setProjectFrameRate] = useState<number>(30);
    const [projectDuration, setProjectDuration] = useState<number>(0);
    const [selectedSegment, setSelectedSegment] = useState<SegmentID | null>(null);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(document.createElement("canvas"));
    const [renderer, setRenderer] = useState<WebGLRenderer>(new WebGLRenderer(canvasRef, projectWidth, projectHeight));

    useEffect(() => {
        canvasRef.width = projectWidth;
        canvasRef.height = projectHeight;
    }, [canvasRef, projectHeight, projectWidth]);

    useEffect(() => {
        let duration = 0;
        for (const track of trackList) {
            if (track.length === 0) continue;
            duration = Math.max(duration, track[track.length - 1].start + track[track.length - 1].duration);
        }

        setProjectDuration(duration);
    }, [trackList]);

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
                    trimRight: 0,
                    trimLeft: 0,
                    trimTop: 0,
                    trimBottom: 0,
                    scaleX: 1.0,
                    scaleY: 1.0,
                },
            ],
            track: trackNum
        };

        setTrackList([
            ...trackList.slice(0, trackNum),
            [...trackList[trackNum], segment],
            ...trackList.slice(trackNum + 1),
        ]);
    }

    const deleteVideo = (media: Media) => {
        setMediaList(mediaList.filter((item: Media) => {
            if (item !== media) media.element.pause();
            return item !== media;
        }));

        setTrackList(trackList.map((track, trackInd) => track.filter((segment, segmentInd) => {
            if (segment.media === media &&
                selectedSegment?.track === trackInd &&
                selectedSegment?.index === segmentInd) setSelectedSegment(null);
            return segment.media !== media;
        })));
    }

    const deleteSelectedSegment = () => {
        if (selectedSegment === null) return;

        trackList[selectedSegment.track][selectedSegment.index].media.element.pause();
        setTrackList([
            ...trackList.slice(0, selectedSegment.track),
            [...trackList[selectedSegment.track].slice(0, selectedSegment.index), ...trackList[selectedSegment.track].slice(selectedSegment.index + 1)],
            ...trackList.slice(selectedSegment.track + 1)
        ]);
        setSelectedSegment(null);
    }
    const split = (timestamp: number) => {
        if (selectedSegment === null) return;

        const segment = trackList[selectedSegment.track][selectedSegment.index];

        if (segment.start > timestamp || segment.start + segment.duration < timestamp) return;

        setTrackList([
            ...trackList.slice(0, selectedSegment.track),
            [
                ...trackList[selectedSegment.track].slice(0, selectedSegment.index),
                { ...trackList[selectedSegment.track][selectedSegment.index], duration: timestamp - segment.start },
                {
                    media: segment.media,
                    start: timestamp,
                    duration: segment.start + segment.duration - timestamp,
                    mediaStart: timestamp - segment.start,
                    texture: segment.texture,
                    keyframes: segment.keyframes,
                    track: selectedSegment.track
                },
                ...trackList[selectedSegment.track].slice(selectedSegment.index + 1)
            ],
            ...trackList.slice(selectedSegment.track + 1)
        ]);
    }

    const updateSegment = (id: SegmentID, newSegment: Segment) => {
        setTrackList([
            ...trackList.slice(0, id.track),
            [...trackList[id.track].slice(0, id.index), newSegment, ...trackList[id.track].slice(id.index + 1)],
            ...trackList.slice(id.track + 1)
        ]);
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
            splitVideo={split}
        />
    );
}
