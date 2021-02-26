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
        deleteSelectedSegment
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
        }
) {
    const togglePlaying = () => {
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    };


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
            <button className={styles.button} onClick={togglePlaying}>
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
                value={projectDuration == 0 ? 0 : currentTime / projectDuration}
            ></input>
            <button className={styles.button}>
                <span className="material-icons">volume_up</span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">add</span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">remove</span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">undo</span>
            </button>
            <button className={styles.button} onClick={createSplit}>
                <span className="material-icons">content_cut</span>
            </button>
            <button className={styles.button} onClick={deleteSelectedSegment}>
                <span className="material-icons">delete</span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">content_copy</span>
            </button>
        </div>
    );
}
