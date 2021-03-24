import { useEffect, useRef, useState } from "react";
import PlaybackController from "./playbackController";
import { Media, Segment, SegmentID } from "./types";
import { WebGLRenderer } from "./webgl";

export default function MediaManager(props: {
    projectUser: string;
    setProjectUser: (user: string) => void;
    projectHeight: number;
    setProjectHeight: (height: number) => void;
    projectWidth: number;
    setProjectWidth: (width: number) => void;
    projectFramerate: number;
    setProjectFramerate: (framerate: number) => void;
    projectName: string;
    setProjectName: (name: string) => void;
    projectId: string;
    setProjectId: (id: string) => void;
    projectDuration: number;
    setProjectDuration: (duration: number) => void;
}) {
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [trackList, setTrackList] = useState<Segment[][]>([[]]);
    const [selectedSegment, setSelectedSegment] = useState<SegmentID | null>(null);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement>(document.createElement("canvas"));
    const [renderer, setRenderer] = useState<WebGLRenderer>(new WebGLRenderer(canvasRef, props.projectWidth, props.projectHeight));

    useEffect(() => {
        canvasRef.width = props.projectWidth;
        canvasRef.height = props.projectHeight;
    }, [canvasRef, props.projectHeight, props.projectWidth]);

    useEffect(() => {
        let duration = 0;
        for (const track of trackList) {
            if (track.length === 0) continue;
            duration = Math.max(duration, track[track.length - 1].start + track[track.length - 1].duration);
        }

        props.setProjectDuration(duration);
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
            sources: [{ track: 0, element: elm, inUse: false }],
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

    const dragAndDrop = (media: Media) => {
        if (renderer == null) return;
        let segment: Segment = {
            media: media,
            start: 0,
            duration: media.sources[0].element.duration * 1000,
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
            ]
        };

        let newElement = media.sources[0].element.cloneNode() as HTMLVideoElement;
        newElement.pause();

        if (trackList[trackList.length - 1].length === 0) {
            if (!media.sources.find(source => source.track === trackList.length - 1))
                media.sources.push({ track: trackList.length - 1, element: newElement, inUse: false });
            setTrackList([...trackList.slice(0, trackList.length - 1), [segment], []]);
        } else {
            media.sources.push({ track: trackList.length, element: newElement, inUse: false });
            setTrackList([...trackList, [segment], []]);
        }
    }

    const deleteVideo = (media: Media) => {
        for (const source of media.sources) {
            source.element.pause();
        }

        if (selectedSegment && trackList[selectedSegment.track][selectedSegment.index].media === media) setSelectedSegment(null);
        setMediaList(mediaList.filter(item => item !== media));

        let newTrackList = trackList.map(track => track.filter(segment => segment.media !== media));

        // Clean Tracklist
        while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0) newTrackList.pop();
        newTrackList.push([]);

        setTrackList(newTrackList);
    }

    const deleteSelectedSegment = () => {
        if (selectedSegment === null) return;

        for (const source of trackList[selectedSegment.track][selectedSegment.index].media.sources) {
            source.element.pause();
        }

        let newTrackList = [
            ...trackList.slice(0, selectedSegment.track),
            [...trackList[selectedSegment.track].slice(0, selectedSegment.index), ...trackList[selectedSegment.track].slice(selectedSegment.index + 1)],
            ...trackList.slice(selectedSegment.track + 1)
        ];

        // Clean Tracklist
        while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0) newTrackList.pop();
        newTrackList.push([]);

        setTrackList(newTrackList);
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
                    keyframes: segment.keyframes
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
            renderer={renderer}
            dragAndDrop={dragAndDrop}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            updateSegment={updateSegment}
            splitVideo={split}
        />
    );
}
