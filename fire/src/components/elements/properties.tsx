import styles from "./properties.module.css";
import { ChangeEvent } from "react";
import { Segment, SegmentID } from "../../model/types";

export default function Properties({
    trackList,
    selectedSegment,
    updateSegment,
    currentTime,
}: {
    currentTime: number,
    trackList: Segment[][],
    selectedSegment: SegmentID,
    updateSegment: (id: SegmentID, segment: Segment) => void
}) {
    const segment = trackList[selectedSegment.track][selectedSegment.index];

    const changeX = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[0], x: +event.target.value, }] });
    }

    const changeY = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[0], y: +event.target.value, }] });
    };

    const zoomHeight = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[0], scaleY: +event.target.value, }] });
    };

    const zoomWidth = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[0], scaleX: +event.target.value, }] });
    };

    return (
        <div className={styles.container}>
            <label className={styles.pos}>
                Scaling Options:
        </label>
            <label className={styles.tags}>
                Position:
        </label>
            <span>
                <label className={styles.tags}>X:</label>
                <input
                    name="X"
                    className={styles.inputTag}
                    type="number"
                    step="10"
                    placeholder="0"
                    onChange={changeX}
                    value={segment.keyframes[0].x}
                />
            </span>
            <span>
                <label className={styles.tags}>Y:</label>
                <input
                    name="Y"
                    className={styles.inputTag}
                    type="number"
                    step="10"
                    placeholder="0"
                    onChange={changeY}
                    value={segment.keyframes[0].y}
                />
            </span>

            <label className={styles.tags}>
                Zoom:
      </label>
            <span>
                <label className={styles.tags}>X:</label>
                <input
                    name="height"
                    className={styles.inputTag}
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100.0"
                    onChange={zoomWidth}
                    value={segment.keyframes[0].scaleX}
                />
            </span>
            <span>
                <label className={styles.tags}>Y:</label>
                <input
                    name="width"
                    className={styles.inputTag}
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100.0"
                    onChange={zoomHeight}
                    value={segment.keyframes[0].scaleY}
                />
            </span>
        </div>
    );
}
