import Editor from "../routes/editor";
import { Media, Segment, SegmentID } from "./types";
import React, { useEffect, useRef, useState } from "react";
import { WebGLRenderer } from "./webgl";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import About from "../routes/about";
import ExportPage from "../routes/exportPage";
import { setSamplerParameters } from "twgl.js";

export default function PlaybackController(props: {
  canvasRef: HTMLCanvasElement;
  mediaList: Media[];
  setMediaList: (mediaList: Media[]) => void;
  trackList: Segment[][];
  setTrackList: (segments: Segment[][]) => void;
  addVideo: (file: File[]) => void;
  deleteVideo: (media: Media) => void;
  projectWidth: number;
  projectHeight: number;
  renderer: WebGLRenderer;
  projectFrameRate: number;
  projectDuration: number;
  dragAndDrop: (timestamp: number, media: Media, trackNum: number) => void;
  setSelectedSegment: (selected: SegmentID | null) => void;
  selectedSegment: SegmentID | null;
  updateSegment: (id: SegmentID, segment: Segment) => void;
  splitVideo: (timestamp: number) => void;
  deleteSelectedSegment: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isRecordingRef = useRef(false);
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
  var recordedChunks: Array<any>;
  let mediaRecorder: MediaRecorder;

  const setCurrentTime = (timestamp: number) => {
    lastPlaybackTimeRef.current = timestamp;
    playbackStartTimeRef.current = performance.now();
    _setCurrentTime(timestamp);
    if (!isPlayingRef.current) renderFrame(false);
  };

  useEffect(() => {
    if (!isPlayingRef.current) renderFrame(false);
  }, [props.trackList]);

  useEffect(() => {
    if (currentTime > props.projectDuration)
      setCurrentTime(props.projectDuration);
  }, [props.projectDuration]);

  const renderFrame = async (update: boolean) => {
    let curTime =
      performance.now() -
      playbackStartTimeRef.current +
      lastPlaybackTimeRef.current;
    if (!update) curTime = lastPlaybackTimeRef.current;
    if (curTime >= projectDurationRef.current)
      curTime = projectDurationRef.current;
    _setCurrentTime(curTime);

    let segments = [];
    let needsSeek = false;
    let toStop: Media[] = [];
    for (const segment of trackListRef.current[0]) {
      if (
        !(
          curTime >= segment.start && curTime < segment.start + segment.duration
        )
      ) {
        toStop.push(segment.media);
        continue;
      }

      let mediaTime = curTime - segment.start + segment.mediaStart;
      if (
        Math.abs(segment.media.element.currentTime * 1000 - mediaTime) >
          SKIP_THREASHOLD ||
        segment.media.element.paused
      )
        needsSeek = true;
      segments.push(segment);
    }

    for (const media of toStop) {
      if (segments.findIndex((item) => item.media === media) === -1)
        try {
          media.element.pause();
        } catch (error) {}
    }

    if (needsSeek) {
      if (isRecordingRef.current) {
        console.log("Recording Stopped");
        mediaRecorder.pause();
      }
      for (const segment of segments) {
        try {
          segment.media.element.pause();
        } catch (error) {}
        let mediaTime = (curTime - segment.start + segment.mediaStart) / 1000;

        if (segment.media.element.currentTime !== mediaTime) {
          await new Promise<void>((resolve, reject) => {
            segment.media.element.onseeked = () => resolve();
            segment.media.element.currentTime = mediaTime;
          });
        }
      }
      await Promise.all(
        segments.map((segment) => segment.media.element.play())
      );
      if (isRecordingRef.current) {
        console.log("Recording Started Again");
        mediaRecorder.resume();
      }
      lastPlaybackTimeRef.current = curTime;
      playbackStartTimeRef.current = performance.now();
    }

    props.renderer.drawSegments(segments, curTime);

    if (!isPlayingRef.current) {
      for (const segment of trackListRef.current[0]) {
        try {
          segment.media.element.pause();
        } catch (error) {}
      }
      return;
    }

    if (curTime === projectDurationRef.current) {
      pause();
      console.log("Video Ended");
      if (isRecordingRef.current) {
        mediaRecorder.stop();
        isRecordingRef.current = false;
      }
      return;
    }

    (setTimeout(() => {
      renderFrame(true);
    }, 1 / props.projectFrameRate) as unknown) as number;
  };

  const play = async () => {
    if (currentTime >= projectDurationRef.current) return;

    setIsPlaying(true);
    lastPlaybackTimeRef.current = currentTime;
    playbackStartTimeRef.current = performance.now();
    isPlayingRef.current = true;

    renderFrame(true);
  };

  const pause = () => {
    setIsPlaying(false);

    for (const segment of props.trackList[0]) {
      segment.media.element.pause();
    }
  };

  function Render() {
    var canvas: HTMLCanvasElement | null = props.canvasRef;

    // Optional frames per second argument.
    if (canvas != null) {
      var stream = canvas.captureStream(props.projectFrameRate);
      recordedChunks = [];

      console.log(stream);
      var options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = handleDataAvailable;
      setCurrentTime(0);
      isRecordingRef.current = true;
      mediaRecorder.start();
      play();
      console.log(props.projectDuration);
    }
  }

  function handleDataAvailable(event: any) {
    console.log("data-available");
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      console.log(recordedChunks);
    }
  }

  return (
    <Router>
      <Switch>
        <Route path="/exportpage">
          <ExportPage Render={Render}></ExportPage>
        </Route>
        <Route path="/about">
          <About></About>
        </Route>
        <Route path="/">
          <Editor
            {...props}
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
