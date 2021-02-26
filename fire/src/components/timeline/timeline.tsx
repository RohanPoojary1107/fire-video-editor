import styles from "./timeline.module.css";
import { Segment } from "../../model/types";

export default function Timeline(props: {
    trackList: Segment[][],
    projectDuration: number,
    selectedSegment: Segment | null,
    setSelectedSegment: (selected: Segment | null) => void,
    currentTime: number,
    setCurrentTime: (timestamp: number) => void
}) {
    const SCALE_FACTOR = 0.05;
    const COLORS = [[255, 0, 0], [82, 0, 255], [0, 255, 15], [234, 0, 255], [25, 0, 255], [255, 231, 0]];
    const COLOR_MULTIPLER = 0.5;

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
                    className={`${styles.card} ${props.selectedSegment === segment ? styles.cardActive : ""}`}
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
                        props.setSelectedSegment(segment)
                    }}
                >
                </div>
            );
        }

        return <div className={styles.track}>{segmentDivs}</div>;
    }

    return (
        <div className={styles.container}
            onClick={() => props.setSelectedSegment(null)}
        >
            <div style={{
                transform: `translateX(${props.currentTime * SCALE_FACTOR}px)`
            }} className={styles.pointer}>
                <div className={styles.highlight}></div>
                <div className={styles.indicator}></div>
            </div>
            <div className={styles.tracks}>
                {ruler()}
                {props.trackList.map(track => genTrack(track))}
            </div>
        </div >
    );
}
