import Editor from "../routes/editor";
import { Media, Project, Segment, SegmentID, Source } from "./types";
import React, { useEffect, useRef, useState } from "react";
import { WebGLRenderer } from "./webgl";
import { Route, BrowserRouter as Router, Switch, Redirect } from "react-router-dom";
import About from "../routes/about";
import ExportPage from "../routes/exportPage";
import Login from "../routes/login";
import Projects from "../routes/projects";

export default function PlaybackController(props: {
  setProjects: (projects: Project[]) => void;
  projects: Project[];
  projectUser: string;
  setProjectUser: (user: string) => void;
  canvasRef: HTMLCanvasElement;
  mediaList: Media[];
  setMediaList: (mediaList: Media[]) => void;
  trackList: Segment[][];
  setTrackList: (segments: Segment[][]) => void;
  addVideo: (file: File[]) => void;
  deleteVideo: (media: Media) => void;
  renderer: WebGLRenderer;
  dragAndDrop: (media: Media) => void;
  setSelectedSegment: (selected: SegmentID | null) => void;
  selectedSegment: SegmentID | null;
  updateSegment: (id: SegmentID, segment: Segment) => void;
  splitVideo: (timestamp: number) => void;
  deleteSelectedSegment: () => void;
  projectWidth: number;
  projectHeight: number;
  projectFramerate: number;
  projectDuration: number;
  projectId: string;
  setProjectId: (id: string) => void;
  setProjectDuration: (duration: number) => void;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isRecordingRef = useRef(false);
  const [currentTime, _setCurrentTime] = useState<number>(0);
  const trackListRef = useRef(props.trackList);
  const playbackStartTimeRef = useRef(0);
  const lastPlaybackTimeRef = useRef(0);
  const projectDurationRef = useRef(0);
  const mediaListRef = useRef<Media[]>([]);
  const isPlayingRef = useRef(false);
  const SKIP_THREASHOLD = 100;
  let recordedChunks: Array<any>;
  const mediaRecorderRef = useRef<MediaRecorder>();

  trackListRef.current = props.trackList;
  projectDurationRef.current = props.projectDuration;
  mediaListRef.current = props.mediaList;
  isPlayingRef.current = isPlaying;

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
    console.log(curTime);

    for (const media of mediaListRef.current) {
      for (const source of media.sources) {
        source.inUse = false;
      }
    }

    let segments: Segment[] = [];
    let elements: HTMLVideoElement[] = [];
    let needsSeek = false;

    for (let i = trackListRef.current.length - 1; i >= 0; i--) {
      for (let j = 0; j < trackListRef.current[i].length; j++) {
        const segment = trackListRef.current[i][j];
        if (
          curTime >= segment.start &&
          curTime < segment.start + segment.duration
        ) {
          let source = segment.media.sources.find(
            (source) => source.track === i
          ) as Source;
          source.inUse = true;
          let mediaTime = curTime - segment.start + segment.mediaStart;
          if (
            Math.abs(source.element.currentTime * 1000 - mediaTime) >
            SKIP_THREASHOLD ||
            source.element.paused
          )
            needsSeek = true;
          segments.push(segment);
          elements.push(source.element);
        }
      }
    }

    for (const media of mediaListRef.current) {
      for (const source of media.sources) {
        if (!source.inUse) {
          source.element.pause();
          source.inUse = true;
        }
      }
    }

    if (needsSeek) {
      if (isRecordingRef.current) {
        console.log("Recording Stopped");
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.pause();
      }
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        elements[i].pause();
        let mediaTime = (curTime - segment.start + segment.mediaStart) / 1000;

        if (elements[i].currentTime !== mediaTime) {
          await new Promise<void>((resolve, reject) => {
            elements[i].onseeked = () => resolve();
            elements[i].currentTime = mediaTime;
          });
        }
      }
      try {
        await Promise.allSettled(elements.map((element) => element.play()));
      } catch (error) { }
      lastPlaybackTimeRef.current = curTime;
      playbackStartTimeRef.current = performance.now();
      if (isRecordingRef.current) {
        console.log("Recording Started Again");
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.resume();
      }
    }

    props.renderer.drawSegments(segments, elements, curTime);

    if (!isPlayingRef.current) {
      for (const element of elements) {
        element.pause();
      }
      return;
    }

    if (curTime === projectDurationRef.current) {
      pause();
      console.log("Video Ended");
      if (isRecordingRef.current) {
        if (mediaRecorderRef.current != null) mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
      }
      return;
    }

    (setTimeout(() => {
      renderFrame(true);
    }, 1 / props.projectFramerate) as unknown) as number;
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
  };

  function Render() {
    let canvas: HTMLCanvasElement | null = props.canvasRef;

    // Optional frames per second argument.
    if (canvas != null) {
      let stream = canvas.captureStream(props.projectFramerate);
      recordedChunks = [];
      let options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = download;
      setCurrentTime(0);
      console.log(currentTime);
      isRecordingRef.current = true;
      mediaRecorderRef.current.start();
      console.log("Recording Started");
      setIsPlaying(true);
      renderFrame(true);
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

  function download() {
    var blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <Router>
      <Switch>
        <Route path="/export">
          <ExportPage
            Render={Render}
            setCurrentTime={setCurrentTime}
            trackList={props.trackList}
            projectDuration={props.projectDuration}
            currentTime={currentTime}
            isRecordingRef={isRecordingRef}
          ></ExportPage>
        </Route>
        <Route path="/about">
          <About></About>
        </Route>
        <Route path="/projects">
          {props.projectUser != "" ? <Projects
            projectUser={props.projectUser}
            projects={props.projects}
            setProjects={props.setProjects}
          /> : <Redirect to='/' />}
        </Route>
        <Route path="/editor">
          {props.projectUser != "" ? <Editor
            {...props}
            playVideo={play}
            pauseVideo={pause}
            isPlaying={isPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
          /> : <Redirect to='/' />}
        </Route>
        <Route path="/">
          {props.projectUser === "" ? <Login
            projectUser={props.projectUser}
            setProjectUser={props.setProjectUser} />
            : <Redirect to='/projects' />}
        </Route>
      </Switch>
    </Router>
  );
}
