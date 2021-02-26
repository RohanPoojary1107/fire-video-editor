import styles from "./timeline.module.css";
import { Segment } from "../../model/types";
import { useState, MouseEvent, useRef, useEffect } from "react";

export default function Timeline(props: {
    trackList: Segment[][],
    projectDuration: number,
    selectedSegment: Segment | null,
    setSelectedSegment: (selected: Segment | null) => void,
    currentTime: number,
    setCurrentTime: (timestamp: number) => void,
    updateSegment: (oldSeg: Segment, segment: Segment) => void
}) {
    enum DragMode {
        NONE,
        MOVE,
        TRIM_LEFT,
        TRIM_RIGHT,
    }
    const SCALE_FACTOR = 0.05;
    const COLORS = [[255, 0, 0], [82, 0, 255], [0, 255, 15], [234, 0, 255], [25, 0, 255], [255, 231, 0]];
    const COLOR_MULTIPLER = 0.5;
    const [dragMode, setDragMode] = useState<DragMode>(DragMode.MOVE);
    const timeout = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [trackDivs, setTrackDivs] = useState<JSX.Element[]>([]);
    const dragStartRef = useRef<number>(0);

    const formatTime = (time: number) => {
        let s = (time / 1000).toFixed(2) + "s";
        // while (s.length < (2 || 2)) { s = "0" + s; }
        return s;
    }

    const lerp = (start: number, end: number, t: number) => {
        return (end - start) * t + start;
    }

    const ruler = () => {
        let rows: any[] = [];

        if (props.projectDuration > 0) {
            let divisions = 10;
            for (let i = 0; i < divisions; i++) {
                let time = props.projectDuration / divisions * i;
                rows.push(
                    <div className={styles.s10} key={time}
                        style={{ flex: `0 0 ${props.projectDuration / divisions * SCALE_FACTOR}px` }}
                        onClick={(event) => {
                            event.stopPropagation();
                            props.setCurrentTime(lerp(time, props.projectDuration / divisions * (i + 1), event.nativeEvent.offsetX / ((props.projectDuration / divisions) * SCALE_FACTOR)));
                        }} >
                        <p className={styles.time}>{formatTime(time)}</p>
                        {/* <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div>
                    <div className={styles.sec}></div> */}
                        {/* {index === 0 ? <div ref={setFirstLine} className={styles.sec} style={{ height: 12 }}></div> : ''} */}
                    </div>
                )
            }
        }

        return <div className={styles.track}>{rows}</div>;
    }

    const genTrack = (segments: Segment[]) => {
        let segmentDivs = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const color = COLORS[i % COLORS.length];
            let space = segment.start - (i == 0 ? 0 : (segments[i - 1].start + segments[i - 1].duration));
            segmentDivs.push(<div style={{ flex: `0 0 ${space * SCALE_FACTOR}px` }}></div>);

            segmentDivs.push(
                <div
                    className={`${styles.card} ${(props.selectedSegment === segment && dragMode === DragMode.MOVE) ? styles.move : ""}`}
                    style={{
                        flex: `0 0 ${segment.duration * SCALE_FACTOR - 4}px`,
                        backgroundImage: `url(${segment.media.thumbnail})`,
                        backgroundSize: "auto 100%",
                        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                        border: `2px solid rgb(${color[0] * COLOR_MULTIPLER}, ${color[1] * COLOR_MULTIPLER}, ${color[2] * COLOR_MULTIPLER})`,
                        boxShadow: props.selectedSegment === segment ? `rgb(${color[0]}, ${color[1]}, ${color[2]}) 4px 0px 10px` : ""
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}

                    onMouseDown={(event) => {
                        if (containerRef.current === null) return;
                        event.stopPropagation();
                        event.preventDefault();
                        props.setSelectedSegment(segment);

                        dragStartRef.current = (event.nativeEvent.clientX - containerRef.current.getBoundingClientRect().left + containerRef.current.scrollLeft);

                        if (event.nativeEvent.offsetX < 50) {
                            setDragMode(DragMode.TRIM_LEFT);
                        } else if (event.nativeEvent.offsetX > (event.nativeEvent.target as HTMLDivElement).clientWidth - 50) {
                            setDragMode(DragMode.TRIM_RIGHT);
                        } else {
                            setDragMode(DragMode.MOVE);
                        }
                    }}
                >
                </div>
            );
        }

        return segmentDivs;
    }

    useEffect(() => {
        setTrackDivs(props.trackList.map(track => <div className={styles.track}>{genTrack(track)}</div>));
    }, [props.trackList, props.selectedSegment, dragMode]);

    const clamp = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
    }

    const handleMove = (event: MouseEvent) => {
        timeout.current = 0;
        if (props.selectedSegment === null || containerRef.current == null) return;

        let end = (event.nativeEvent.clientX - containerRef.current.getBoundingClientRect().left + containerRef.current.scrollLeft);
        let change = (end - dragStartRef.current) / SCALE_FACTOR;
        dragStartRef.current = end;

        if (dragMode === DragMode.MOVE) {
            props.updateSegment(props.selectedSegment, { ...props.selectedSegment, start: clamp(props.selectedSegment.start + change, 0, Infinity) });
        } else if (dragMode === DragMode.TRIM_LEFT) {
        } else if (dragMode === DragMode.TRIM_RIGHT) {
        }
    }

    const onMouseMove = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (timeout.current === 0) timeout.current = setTimeout(() => { handleMove(event); }, 100) as unknown as number;
    }

    const dragEnd = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (dragMode !== DragMode.NONE) setDragMode(DragMode.NONE);
    }

    return (
        <div className={styles.container}
            onClick={() => props.setSelectedSegment(null)}
            onMouseMove={onMouseMove}
            ref={containerRef}
            onMouseLeave={dragEnd}
            onMouseUp={dragEnd}
        >
            <div style={{
                transform: `translateX(${props.currentTime * SCALE_FACTOR}px)`
            }} className={styles.pointer}>
                <div className={styles.highlight}></div>
                <div className={styles.indicator}></div>
            </div>
            <div className={styles.tracks}>
                {ruler()}
                {trackDivs}
            </div>
        </div >
    );
}
