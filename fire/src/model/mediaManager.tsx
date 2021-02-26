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
            track: trackNum
        }
        
        setTrackList([...trackList.slice(0, trackNum), [...trackList[trackNum], segment], ...trackList.slice(trackNum+1)]);
    }

    const deleteVideo = (media: Media) => {
        setMediaList(mediaList.filter((item: Media) => item !== media));
        setTrackList(trackList.map((track) => track.filter((item: Segment) => item.media !== media)));
    }

    const split = (timestamp: number) => {
        if (selectedSegment !== null) {
            console.log('split reached!', timestamp);
            let duration = selectedSegment.duration;
            let track = selectedSegment.track;
            // start & end is relative to timeline
            let start = selectedSegment.start;
            let end = start + duration;
            let index = getSegement(timestamp, track);
            console.log("index, track", index, track);
            if (index!==-1){
                
                // create and change new Segment properties to adjust to timestamp
                let newSegment: Segment = {
                    media: selectedSegment.media,
                    start: timestamp,
                    duration: end-timestamp,
                    mediaStart: timestamp - start,
                    texture: selectedSegment.texture,
                    // TODO: Deep copy keyframes adjusted to the split
                    keyframes: selectedSegment.keyframes,
                    track: selectedSegment.track
                }

                // update original Segment properties to prevent overlap
                
                // include new Segment to TrackList
                let newTrackList = [];
                for(let i=0; i<trackList.length; i++){
                    console.log('i', i)
                    if(i===track){
                        let newSegmentList = [];
                        for(let j=0; j<trackList[i].length; j++){
                            console.log('j', i)
                            // TODO: Deep copy keyframes adjusted to the split
                            if(j===index){
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
                setTrackList(newTrackList);
                // setTrackList([...trackList.slice(0, track), [...trackList[track].splice(index+1), newSegment], ...trackList.slice(track+1)]);
            }
        }
    }

    // given specified trackNum, return the index of the segment given timestamp
    // if no segement exists, return -1
    const getSegement = (timestamp: number, trackNum: number) => {
        var index = -1;
        if (selectedSegment !== null) {

            for(let i=0; i<trackList.length; i++){
                console.log('looping' ,i)
                let duration = trackList[trackNum][i].duration;
                // start & end is relative to timeline
                let start = trackList[trackNum][i].start;
                let end = start + duration;
                console.log(start, timestamp, end);
                if(start <= timestamp && end > timestamp){
                    index = i;
                    break;
                }
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
            splitVideo={split}
        />
    );
}
