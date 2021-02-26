import Editor from "../routes/editor";
import { Media, Segment } from "./types";
import React, { useEffect, useRef, useState } from "react";
import { WebGLRenderer } from "./webgl";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import About from "../routes/about";

export default function PlaybackController(props: {
    canvasRef: HTMLCanvasElement,
    mediaList: Media[],
    setMediaList: (mediaList: Media[]) => void,
    trackList: Segment[][],
    setTrackList: (segments: Segment[][]) => void,
    addVideo: (file: File[]) => void,
    deleteVideo: (media: Media) => void,
    projectWidth: number,
    projectHeight: number,
    renderer: WebGLRenderer,
    projectFrameRate: number,
    projectDuration: number,
    dragAndDrop: (timestamp: number, media: Media, trackNum: number) => void,
    setSelectedSegment: (selected: Segment | null) => void,
    selectedSegment: Segment | null,
    updateSegment: (oldSeg: Segment, segment: Segment) => void,
    splitVideo: (timestamp: number) => void,
    deleteSelectedSegment: () => void
}) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, _setCurrentTime] = useState<number>(0);
    const trackListRef = useRef(props.trackList);
    const playbackStartTimeRef = useRef(0);
    const lastPlaybackTimeRef = useRef(0);
    const projectDurationRef = useRef(0);
    const isPlayingRef = useRef(false);
    trackListRef.current = props.trackList;
    projectDurationRef.current = props.projectDuration;
    isPlayingRef.current = isPlaying;
    const SKIP_THREASHOLD = 100;

    const setCurrentTime = (timestamp: number) => {
        lastPlaybackTimeRef.current = timestamp;
        playbackStartTimeRef.current = performance.now();
        _setCurrentTime(timestamp);
        if (!isPlayingRef.current) renderFrame(false);
    };

    useEffect(() => {
        if (!isPlayingRef.current) renderFrame(false);
    }, [props.trackList])

    useEffect(() => {
        if (currentTime > props.projectDuration) setCurrentTime(props.projectDuration);
    }, [props.projectDuration])

    const renderFrame = async (update: boolean) => {
        let curTime = performance.now() - playbackStartTimeRef.current + lastPlaybackTimeRef.current;
        if (!update) curTime = lastPlaybackTimeRef.current;
        _setCurrentTime(curTime);

        if (curTime >= projectDurationRef.current) {
            curTime = projectDurationRef.current;
        }

        let segments = [];
        let needsSeek = false;
        for (const segment of trackListRef.current[0]) {
            if (!(curTime >= segment.start && curTime < segment.start + segment.duration)) {
                segment.media.element.pause();
                continue;
            }

            let mediaTime = (curTime - segment.start + segment.mediaStart);
            if (Math.abs(segment.media.element.currentTime * 1000 - mediaTime) > SKIP_THREASHOLD || segment.media.element.paused) {
                needsSeek = true;
            }

            segments.push(segment);
        }

        if (needsSeek) {
            for (const segment of segments) {
                let mediaTime = (curTime - segment.start + segment.mediaStart) / 1000;

                if (segment.media.element.currentTime !== mediaTime) {
                    await new Promise<void>((resolve, reject) => {
                        segment.media.element.onseeked = () => resolve();
                        segment.media.element.currentTime = mediaTime;
                    });
                }
            }
            await Promise.all(segments.map(segment => segment.media.element.play()));
            lastPlaybackTimeRef.current = curTime;
            playbackStartTimeRef.current = performance.now();
        }

        props.renderer.drawSegments(segments, curTime);

        if (!isPlayingRef.current) {
            for (const segment of trackListRef.current[0]) {
                segment.media.element.pause();
            }
            return;
        }

        if (curTime === projectDurationRef.current) {
            pause();
            return;
        }

        setTimeout(() => { renderFrame(true); }, 1 / props.projectFrameRate) as unknown as number;
    }

    const play = async () => {
        if (currentTime >= projectDurationRef.current) return;

        setIsPlaying(true);
        lastPlaybackTimeRef.current = currentTime;
        playbackStartTimeRef.current = performance.now();
        isPlayingRef.current = true;

        renderFrame(true);
    }

    const pause = () => {
        setIsPlaying(false);

        for (const segment of props.trackList[0]) {
            segment.media.element.pause();
        }
    };

    return (
        <Router>
            <Switch>
                <Route path="/about">
                    <About></About>
                </Route>
                <Route path="/">
                    <Editor {...props}
                        playVideo={play}
                        pauseVideo={pause}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        projectDuration={props.projectDuration}
                        setCurrentTime={setCurrentTime}
                    />
                </Route>
            </Switch>
        </Router>
    );
}
