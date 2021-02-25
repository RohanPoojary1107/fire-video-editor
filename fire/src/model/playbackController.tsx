import Editor from "../routes/editor";
import { Media, Segment } from "./types";
import React, { useState } from "react";
import { WebGLRenderer } from "./webgl";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import About from "../routes/about";

export default function PlaybackController(props: {
    canvasRef: HTMLCanvasElement,
    mediaList: Media[],
    setMediaList: (mediaList: Media[]) => void,
    trackList: Segment[][],
    setTrackList: (segments: Segment[][]) => void,
    addVideo: (file: File) => void,
    deleteVideo: (media: Media) => void,
    projectWidth: number,
    projectHeight: number,
    renderer: WebGLRenderer,
    projectFrameRate: number,
    dragAndDrop: (timestamp: number, media: Media, trackNum: number) => void
    selectedSegment: Segment|null,
    setSelectedSegment: (segment: Segment) => void 
    }) {
        
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playbackTimeout, setPlaybackTimeout] = useState<number>(0);
    const [currentSegment, setCurrentSegment] = useState<Segment>();
    const [currentTime, setCurrentTime] = useState<number>(0);

    const renderFrame = (segment: Segment[]) =>{
        props.renderer.drawSegments(segment, currentTime);
        setPlaybackTimeout(setTimeout(() => { renderFrame(segment); }, 1 / props.projectFrameRate) as unknown as number);
    }

    const play = () => {
        console.log(props.trackList);
        if (props.trackList.length === 0 || props.trackList[0].length === 0) return;

        setIsPlaying(true);
        clearTimeout(playbackTimeout);
        for(const segment of props.trackList[0]){
            segment.media.element.play();
        }
        renderFrame(props.trackList[0]);
    }

    const pause = () => {
        setIsPlaying(false);
        clearTimeout(playbackTimeout);

        for (const segment of props.trackList[0]) {
            segment.media.element.pause();
        }
    }

    // This doesn't currently work, we might discard it later.
    const previewVideo = (media: Media) => {
        for(let i=0; i<props.trackList[0].length; i++){
            if(props.trackList[0][i].media === media){
                setCurrentSegment(props.trackList[0][i]);
                break;
            }
        }
    }

    return (
        <Router>
        <Switch>
          <Route path="/about">
            <About></About>
          </Route>
          <Route path="/">
          <Editor {...props} 
            previewVideo={previewVideo} 
            playVideo={play} 
            pauseVideo={pause} 
            isPlaying={isPlaying}
            />
          </Route>
        </Switch>
      </Router>
    );
}
