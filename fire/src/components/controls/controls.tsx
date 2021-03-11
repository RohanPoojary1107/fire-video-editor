import { ChangeEvent } from "react";
import styles from "./controls.module.css";

export default function Controls(
    {
        playVideo,
        pauseVideo,
        isPlaying,
        currentTime,
        projectDuration,
        setCurrentTime,
        splitVideo,
        deleteSelectedSegment,
        setScaleFactor,
        scaleFactor
    }:
        {
            playVideo: any,
            pauseVideo: any,
            isPlaying: boolean,
            currentTime: number,
            projectDuration: number,
            splitVideo: any;
            setCurrentTime: (timestamp: number) => void,
            deleteSelectedSegment: any
            setScaleFactor: (scale: number) => void,
            scaleFactor: number
        }
) {
    const togglePlaying = () => {
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    };

    const increaseScale = () => {
        setScaleFactor(Math.min(1, scaleFactor * 1.2))
    }

    const decreaseScale = () => {
        setScaleFactor(Math.max(0.0001, scaleFactor * 0.8))
    }

    const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(+event.target.value * projectDuration);
    }

    const createSplit = () => {
        splitVideo(currentTime);
    };

    return (
        <div className={styles.container}>
            <button className={styles.button}>
                <span className="material-icons">skip_previous</span>
            </button>
            <button className={styles.button} onClick={togglePlaying} title={isPlaying? "Pause" : "Play"}>
                <span className="material-icons">
                    {isPlaying ? "pause" : "play_arrow"}
                </span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">skip_next</span>
            </button>
            <input
                className={styles.trackbar}
                type="range"
                min="0"
                max="1"
                step={0.001}
                onChange={onSeek}
                value={projectDuration === 0 ? 0 : currentTime / projectDuration}
            ></input>
            <button className={styles.button} title="Volume">
                <span className="material-icons">volume_up</span>
            </button>
            <button className={styles.button} onClick={decreaseScale} title="Zoom out">
                <span className="material-icons">remove</span>
            </button>
            <button className={styles.button} onClick={increaseScale} title="Zoom In">
                <span className="material-icons">add</span>
            </button>
            <button className={styles.button} onClick={createSplit} title="Split">
                <span className="material-icons">content_cut</span>
            </button>
            <button className={styles.button} onClick={deleteSelectedSegment} title="Delete">
                <span className="material-icons">delete</span>
            </button>
            <button className={styles.button} title="Duplicate">
                <span className="material-icons">content_copy</span>
            </button>
        </div>
    );
}
