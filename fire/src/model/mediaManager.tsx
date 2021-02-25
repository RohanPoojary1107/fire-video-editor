import { useEffect, useState } from "react";
import PlaybackController from "./playbackController";
import { Media, Segment } from "./types";
import {WebGLRenderer} from "./webgl";

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
        if(renderer == null)return;
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

        setTrackList([...trackList.slice(0, trackNum), [...trackList[trackNum], segment], ...trackList.slice(trackNum+1)]);
    }

    const deleteVideo = (media: Media) => {
        setMediaList(mediaList.filter((item: Media) => item !== media));
        setTrackList(trackList.map((track) => track.filter((item: Segment) => item.media !== media)));
    }

    const split = (timestamp: number, trackNum: number) => {
        var index = getSegement(timestamp, trackNum);
        
        if (index !== -1) {
            let duration = trackList[trackNum][index].duration;
            // start & end is relative to timeline
            let start = trackList[trackNum][index].start;
            let end = start + duration;

            // create and change new Segment properties to adjust to timestamp
            let newSegment: Segment = {
                media: trackList[trackNum][index].media,
                start: timestamp,
                duration: end-timestamp,
                mediaStart: timestamp - start,
                texture: trackList[trackNum][index].texture,
                // TODO: Deep copy keyframes adjusted to the split
                keyframes: trackList[trackNum][index].keyframes
            }

            // update original Segment properties to prevent overlap
            trackList[trackNum][index].duration = timestamp - start;
            // TODO: Deep copy keyframes adjusted to the split

            // include new Segment to TrackList
            setTrackList([...trackList.slice(0, trackNum), [...trackList[trackNum].splice(index+1), newSegment], ...trackList.slice(trackNum+1)]);

        }
    }
    
    // given specified trackNum, return the index of the segment given timestamp
    // if no segement exists, return -1
    const getSegement = (timestamp: number, trackNum: number) => {
        var index = -1;

        for(let i=0; i<trackList.length; i++){
            let duration = trackList[trackNum][i].duration;
            // start & end is relative to timeline
            let start = trackList[trackNum][i].start;
            let end = start + duration;

            if(start <= timestamp && end > timestamp){
                index = i;
                break;
            }
        }
        return index;
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
        />
    );
}
