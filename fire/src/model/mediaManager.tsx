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
            track: trackNum
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
            if (segment === selectedSegment) setSelectedSegment(null);
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
    const split = (timestamp: number) => {
        if (selectedSegment !== null) {
            let duration = selectedSegment.duration;
            let track = selectedSegment.track;
            // start & end is relative to timeline
            let start = selectedSegment.start;
            let end = start + duration;
            let index = getSegement(timestamp, track);
            // make sure to not split a segment that is not selected
            if (!(start <= timestamp && end > timestamp)) {
                return;
            }
            if (index !== -1) {

                // create and change new Segment properties to adjust to timestamp

                // TODO: fix object copy???
                // let newSegment = Object.assign({}, trackList[track][index]);
                // newSegment.start = timestamp;
                // newSegment.duration = end-timestamp;
                // newSegment.mediaStart =  timestamp - start;

                let newSegment: Segment = {
                    media: selectedSegment.media,
                    start: timestamp,
                    duration: end - timestamp,
                    mediaStart: timestamp - start,
                    texture: selectedSegment.texture,
                    // TODO: Deep copy keyframes adjusted to the split
                    keyframes: selectedSegment.keyframes,
                    track: selectedSegment.track
                }
                // update original Segment properties to prevent overlap

                // include new Segment to TrackList
                let newTrackList = [];
                for (let i = 0; i < trackList.length; i++) {
                    if (i === track) {
                        let newSegmentList = [];
                        for (let j = 0; j < trackList[i].length; j++) {
                            // TODO: Deep copy keyframes adjusted to the split
                            if (j === index) {
                                trackList[i][j].duration = timestamp - start;
                                newSegmentList.push(trackList[i][j]);
                                newSegmentList.push(newSegment);
                            } else {
                                newSegmentList.push(trackList[i][j]);
                            }
                        }
                        newTrackList.push(newSegmentList);
                    }
                    else {
                        newTrackList.push(trackList[i]);
                    }
                }
                console.log('Old Track: ', trackList);
                console.log('New Track: ', newTrackList);
                setTrackList(newTrackList);
            }
        }
    };

    // given specified trackNum, return the index of the segment given timestamp
    // if no segement exists, return -1
    const getSegement = (timestamp: number, trackNum: number) => {
        var index = -1;

        for (let i = 0; i < trackList[trackNum].length; i++) {
            let duration = trackList[trackNum][i].duration;
            // start & end is relative to timeline
            let start = trackList[trackNum][i].start;
            let end = start + duration;
            if (start <= timestamp && end > timestamp) {
                index = i;
                break;
            }
        }
        return index;
    };

    const updateSegment = (oldSeg: Segment, newSegment: Segment) => {
        let projectDuration = 0;
        setTrackList(trackList.map((track) => track.map((segment: Segment) => {
            projectDuration = Math.max(projectDuration, (segment === oldSeg ? (newSegment.start + newSegment.duration) : (segment.start + segment.duration)));
            return segment === oldSeg ? newSegment : segment;
        })));

        if (oldSeg === selectedSegment) setSelectedSegment(newSegment);
        setProjectDuration(projectDuration);
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
