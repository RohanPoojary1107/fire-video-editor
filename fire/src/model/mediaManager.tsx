import { useEffect, useRef, useState } from "react";
import { calculateProperties } from "../utils/utils";
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

        // Find index of current keyframe at timestamp
        // There is always at least 1 keyframe in a segment

        let segmentTimeCut = timestamp - segment.start;
        let lenKeyframes = segment.keyframes.length;
        let keyFrameIndex = 0;
        for (let i = 1; i < lenKeyframes; i++) {
            let checkKeyframe = segment.keyframes[i];
            if (checkKeyframe.start > segmentTimeCut) {
                break;
            }
            keyFrameIndex = i;
        }

        let interpKeyFrame = calculateProperties(segment, timestamp);
  
        // Remove remaining keyframes from split segment
        let leftSegmentKeyFrames = segment.keyframes.slice(0, keyFrameIndex+1);
        // Move remaining keyframes to new split segment
        let rightSegmentKeyFrames = segment.keyframes.slice(keyFrameIndex+1,lenKeyframes);
        
        // Edit new keyframes to new offset
        for (let i = 0; i < rightSegmentKeyFrames.length; i++) {
            rightSegmentKeyFrames[i].start -= segmentTimeCut;
        }

        // Add interpolated keyframe at the end of the selected split segement
        let newInterpKeyFrame = {
            ...interpKeyFrame,
            start: segmentTimeCut - 1/projectFramerate
        };
        leftSegmentKeyFrames.push(newInterpKeyFrame);

        setTrackList([
            ...trackList.slice(0, selectedSegment.track),
            [
                ...trackList[selectedSegment.track].slice(0, selectedSegment.index),
                { ...trackList[selectedSegment.track][selectedSegment.index], duration: timestamp - segment.start,
                    keyframes: leftSegmentKeyFrames },
                {
                    media: segment.media,
                    start: timestamp,
                    duration: segment.start + segment.duration - timestamp,
                    mediaStart: timestamp - segment.start + segment.mediaStart,
                    texture: segment.texture,
                    keyframes: [interpKeyFrame].concat(rightSegmentKeyFrames)
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
