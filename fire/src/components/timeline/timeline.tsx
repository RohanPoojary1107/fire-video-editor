import styles from "./timeline.module.css";
import { Media, Segment, SegmentID } from "../../model/types";
import { useState, MouseEvent, useRef, useEffect } from "react";
import { lerp } from "../../utils/utils";
import { Droppable } from 'react-beautiful-dnd';

export default function Timeline({
    trackList,
    projectDuration,
    selectedSegment,
    setSelectedSegment,
    currentTime,
    setCurrentTime,
    updateSegment,
    scaleFactor,
    setTrackList,
}: {
    trackList: Segment[][],
    projectDuration: number,
    selectedSegment: SegmentID | null,
    setSelectedSegment: (selected: SegmentID | null) => void,
    currentTime: number,
    setCurrentTime: (timestamp: number) => void,
    updateSegment: (id: SegmentID, segment: Segment) => void,
    scaleFactor: number,
    setTrackList: (tracks: Segment[][]) => void
}) {
    enum DragMode {
        NONE,
        MOVE,
        TRIM_LEFT,
        TRIM_RIGHT
    }

    const COLORS = [[255, 0, 0], [82, 0, 255], [0, 255, 15], [234, 0, 255], [25, 0, 255], [255, 231, 0]];
    const RESIZE_OFFSET = 10;
    const COLOR_MULTIPLER = 0.5;
    const timeout = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [trackDivs, setTrackDivs] = useState<JSX.Element[]>([]);
    const segmentStartOffsetRef = useRef<number>(0);
    const clickStartTimeRef = useRef<number>(-1);
    const dragMode = useRef<DragMode>(DragMode.NONE);

    const formatTime = (time: number) => {
        let s = parseFloat((time / 1000).toFixed(2));

        let currentMinute = Math.floor(s / 60);
        let currentSecond = Math.floor(s / 1) - currentMinute * 60;
        let currentMillisecond = (s - Math.floor(s / 1))*100;
        currentSecond = currentSecond + Math.floor(currentMillisecond/30);
        currentMillisecond = currentMillisecond - 30*Math.floor(currentMillisecond/30);
        let minute = String(currentMinute);
        while (minute.length < (2 || 2)) { minute = "0" + minute; }
        let second = String(currentSecond);
        while (second.length < (2 || 2)) { second = "0" + second; }
        let millisecond = currentMillisecond.toFixed(0);
        while (millisecond.length < (2 || 2)) { millisecond = "0" + millisecond; }

        return minute + ":" + second+ ":" + millisecond;
    }

    const ruler = () => {
        if (!containerRef.current) return;
        let rows: any[] = [];

        let length = Math.max(containerRef.current.clientWidth / scaleFactor, projectDuration);
        let divisions = Math.floor(length * scaleFactor / 100);

        for (let i = 0; i < divisions; i++) {
            let time = length / divisions * i;
            rows.push(
                <div className={styles.s10} key={time}
                    style={{ flex: `0 0 ${length / divisions * scaleFactor}px` }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setCurrentTime(lerp(time, length / divisions * (i + 1), event.nativeEvent.offsetX / ((length / divisions) * scaleFactor)));
                    }} >
                    <p className={styles.time}>{formatTime(time)}</p>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    {i === 0 ? <div className={styles.sec} style={{ height: 14 }}></div> : ''}
                </div>
            )
        }

        return <div className={`${styles.track} ${styles.ruler}`}>{rows}</div>;
    }

    const calculateHoverState = (event: MouseEvent) => {
        if (containerRef.current === null || clickStartTimeRef.current !== -1) return;
        event.stopPropagation();
        event.preventDefault();

        if (event.nativeEvent.offsetX < RESIZE_OFFSET) {
            setDragMode(DragMode.TRIM_LEFT);
        } else if (event.nativeEvent.offsetX > (event.nativeEvent.target as HTMLDivElement).clientWidth - RESIZE_OFFSET) {
            setDragMode(DragMode.TRIM_RIGHT);
        } else {
            setDragMode(DragMode.MOVE);
        }
    };

    const genTrack = (segments: Segment[], trackInd: number) => {
        let segmentDivs = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const color = COLORS[i % COLORS.length];
            const isSelected = selectedSegment !== null && selectedSegment.track === trackInd && selectedSegment.index === i;

            let space = segment.start - (i === 0 ? 0 : (segments[i - 1].start + segments[i - 1].duration));
            segmentDivs.push(<div style={{ flex: `0 0 ${space * scaleFactor}px` }}></div>);

            segmentDivs.push(
                <div className={`${styles.fullCard}`}
                    style={{
                        flex: `0 0 ${segment.duration * scaleFactor - 4}px`
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <div
                        className={`${styles.card}`}
                        style={{
                            backgroundImage: `url(${segment.media.thumbnail})`,
                            backgroundSize: "auto 100%",
                            backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                            border: `2px solid rgb(${isSelected ? color[0] : (color[0] * COLOR_MULTIPLER)}, ${isSelected ? color[2] : (color[2] * COLOR_MULTIPLER)}, ${isSelected ? color[2] : (color[2] * COLOR_MULTIPLER)})`,
                            borderRadius: "2px",
                            boxShadow: isSelected ? `rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.5) 0px 0px 10px` : "",
                            height: "56px"
                        }}

                        onMouseDown={(event) => {
                            if (containerRef.current === null || event.button !== 0) return;
                            event.stopPropagation();
                            setSelectedSegment({ track: trackInd, index: i });

                            clickStartTimeRef.current = (event.nativeEvent.clientX - containerRef.current.getBoundingClientRect().left + containerRef.current.scrollLeft) / scaleFactor;
                            segmentStartOffsetRef.current = clickStartTimeRef.current - trackList[trackInd][i].start;

                            calculateHoverState(event);
                        }}

                        onMouseMove={calculateHoverState}

                        onMouseLeave={() => { if (clickStartTimeRef.current === -1) setDragMode(DragMode.NONE); }}
                    >
                    </div>
                    {isSelected ? <div className={`${styles.keyframeCard}`}>
                        {segment.keyframes.map((keyframe) => {
                            if (segment.keyframes.length > 1) {
                                return (
                                    <button
                                        style={{
                                            transform: `translateX(${(keyframe.start) * scaleFactor}px) rotate(45deg)`
                                        }}
                                        className={styles.keyframeBtn}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setCurrentTime(segment.start + keyframe.start);
                                        }}

                                        onDoubleClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                    ></button>
                                );
                            }
                            else {
                                return ("");
                            }
                        })}
                    </div> : ""}
                </div>
            );
        }

        return segmentDivs;
    }

    useEffect(() => {
        setTrackDivs(trackList.map((track, ind) => <div className={styles.track}>{genTrack(track, ind)}</div>));
    }, [trackList, selectedSegment, scaleFactor]);

    useEffect(() => {
        let listener = (event: globalThis.MouseEvent) => {
            if (event.button === 0 && clickStartTimeRef.current !== -1) {
                event.stopPropagation();
                event.preventDefault();
                setDragMode(DragMode.NONE);
                clickStartTimeRef.current = -1;
            }
        }

        document.addEventListener("mouseup", listener);
        return () => { document.removeEventListener("mouseup", listener); };
    }, [])

    const setDragMode = (mode: DragMode) => {
        dragMode.current = mode;

        if (mode === DragMode.MOVE) {
            document.body.style.cursor = "move";
        } else if (mode === DragMode.TRIM_LEFT) {
            document.body.style.cursor = "ew-resize";
        } else if (mode === DragMode.TRIM_RIGHT) {
            document.body.style.cursor = "ew-resize";
        } else {
            document.body.style.cursor = "";
        }
    }

    const clamp = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
    }

    const handleMove = (event: MouseEvent) => {
        timeout.current = 0;
        if (selectedSegment === null || containerRef.current === null || clickStartTimeRef.current === -1) return;

        const segment = trackList[selectedSegment.track][selectedSegment.index];

        let end = (event.nativeEvent.clientX - containerRef.current.getBoundingClientRect().left + containerRef.current.scrollLeft) / scaleFactor;
        let change = end - clickStartTimeRef.current;
        clickStartTimeRef.current = end;

        let y = event.nativeEvent.clientY - containerRef.current.getBoundingClientRect().top + containerRef.current.scrollTop;
        let track = Math.max(Math.floor((y - 40) / 81), 0);

        if (dragMode.current === DragMode.MOVE) {
            // Create a new track
            if (track >= trackList.length - 1) {
                trackList.push([]);
                track = trackList.length - 2;
            }

            let requestedTime = Math.max(end - segmentStartOffsetRef.current, 0);
            let foundTime = Infinity;
            let startTime = 0;
            let endTime = 0;

            // Search for closest opening to the requested time
            for (let i = 0; i < trackList[track].length + 1; i++) {
                if (selectedSegment.track === track && selectedSegment.index === i) continue;

                endTime = i < trackList[track].length ? trackList[track][i].start : Infinity;

                if (segment.duration <= endTime - startTime) {
                    if (requestedTime >= startTime && requestedTime + segment.duration < endTime) {
                        foundTime = requestedTime;
                        break;
                    }

                    let newTime = requestedTime < startTime ? startTime : endTime - segment.duration;

                    if (Math.abs(requestedTime - newTime) < Math.abs(requestedTime - foundTime)) {
                        foundTime = newTime;
                    }
                }

                if (i < trackList[track].length) {
                    startTime = trackList[track][i].start + trackList[track][i].duration;
                }
            }

            // Setup new element for track
            if (track !== selectedSegment.track) {
                if (!segment.media.sources.find(source => source.track === track)) {
                    let newElement = segment.media.sources[0].element.cloneNode() as HTMLVideoElement;
                    newElement.pause();
                    segment.media.sources.push({ track: track, element: newElement, inUse: false });
                }
            }

            // Insert new Segment and remove old
            let newSegment = { ...segment, start: foundTime };
            let insertedInd = -1;
            let newTrackList = [];
            for (let i = 0; i < trackList.length; i++) {
                let x = [];
                for (let j = 0; j < trackList[i].length; j++) {
                    if (i === selectedSegment.track && j === selectedSegment.index) continue;

                    if (i === track && insertedInd === -1 && trackList[i][j].start > foundTime) {
                        x.push(newSegment);
                        insertedInd = x.length - 1;
                    }
                    x.push(trackList[i][j]);
                }
                if (i === track && insertedInd === -1) {
                    x.push(newSegment);
                    insertedInd = x.length - 1;
                }
                newTrackList.push(x);
            }

            while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0) newTrackList.pop();
            newTrackList.push([]);

            setTrackList(newTrackList);
            setSelectedSegment({ track: track, index: insertedInd });
        } else if (dragMode.current === DragMode.TRIM_LEFT) {
            change = clamp(change, -segment.mediaStart, Math.min(segment.media.sources[0].element.duration * 1000 - segment.mediaStart, segment.duration));

            if (selectedSegment.index > 0) {
                change = Math.max(change, -segment.start + trackList[selectedSegment.track][selectedSegment.index - 1].start +
                    trackList[selectedSegment.track][selectedSegment.index - 1].duration);
            }

            updateSegment(selectedSegment, { ...segment, start: segment.start + change, mediaStart: segment.mediaStart + change, duration: segment.duration - change });
        } else if (dragMode.current === DragMode.TRIM_RIGHT) {
            change = clamp(change, -segment.duration, segment.media.sources[0].element.duration * 1000 - segment.mediaStart - segment.duration);

            if (selectedSegment.index < trackList[selectedSegment.track].length - 1) {
                change = Math.min(change, trackList[selectedSegment.track][selectedSegment.index + 1].start - segment.start - segment.duration);
            }

            updateSegment(selectedSegment, { ...segment, duration: segment.duration + change });
        }
    }

    const onMouseMove = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (clickStartTimeRef.current !== -1 && timeout.current === 0) {
            timeout.current = setTimeout(() => { handleMove(event); }, 16) as unknown as number;
        }
    }

    return (
        <div className={styles.container}
            onClick={() => setSelectedSegment(null)}
            onMouseMove={onMouseMove}
            ref={containerRef}
        >
        <Droppable droppableId="timeline">
        {
            (provided) => (
                <div className="timeline" {...provided.droppableProps} ref={provided.innerRef} >
                    <div className={styles.tracks} style={{ minWidth: `${projectDuration * scaleFactor}px`, minHeight:`${containerRef.current?.clientHeight}px`}}>
                        {ruler()}
                        <div style={{
                            transform: `translateX(${currentTime * scaleFactor}px)`
                        }} className={styles.pointer}>
                            <div className={styles.highlight}></div>
                            <div className={styles.indicator}></div>
                        </div>
                        {trackDivs}
                    </div>
                {provided.placeholder}
                </div>
                )
            }
        </Droppable>
        </div >
    );
}
