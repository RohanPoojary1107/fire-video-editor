import styles from "./properties.module.css";
import { ChangeEvent } from "react";
import { Segment, SegmentID } from "../../model/types";

export default function Properties({
    trackList,
    selectedSegment,
    selectedKeyframe,
    setCurrentKey,
    updateSegment,
    currentTime,
}: {
    currentTime: number,
    trackList: Segment[][],
    selectedSegment: SegmentID,
    selectedKeyframe: number,
    setCurrentKey: (index: number) => void,
    updateSegment: (id: SegmentID, segment: Segment) => void
}) {
    const segment = trackList[selectedSegment.track][selectedSegment.index];

    const changeX = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[selectedKeyframe], x: +event.target.value, }] });
    }

    const changeY = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[selectedKeyframe], y: +event.target.value, }] });
    };

    const zoomHeight = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[selectedKeyframe], scaleY: +event.target.value, }] });
    };

    const zoomWidth = (event: ChangeEvent<HTMLInputElement>) => {
        updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[selectedKeyframe], scaleX: +event.target.value, }] });
    };

    return (
        <div className={styles.container}>
            <label className={styles.pos}>
                Scaling Options:
        </label>
            <label className={styles.tags}>
                Position:
                <button className={styles.keyframeNext}><span className="material-icons">keyboard_arrow_right</span></button>
                <button className={styles.keyframeBtn} 
                onClick={(event) => {
                    event.stopPropagation();
                    // let newKey = segment.keyframes.length+1;
                    // console.log(segment.keyframes.length);
                    // console.log(newKey);
                    // updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[newKey]}] });
                    // setCurrentKey(newKey);
                }}
                ><span className="material-icons">circle</span></button>
               <button className={styles.keyframePrev}><span className="material-icons">keyboard_arrow_left</span></button>
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
                    value={segment.keyframes[selectedKeyframe].x}
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
                    value={segment.keyframes[selectedKeyframe].y}
                />
            </span>

            <label className={styles.tags}>
                Scale:
                <button className={styles.keyframeNext}><span className="material-icons">keyboard_arrow_right</span></button>
                <button className={styles.keyframeBtn} 
                onClick={(event) => {
                    event.stopPropagation();
                    // let newKey = segment.keyframes.length+1;
                    // console.log(segment.keyframes.length);
                    // console.log(newKey);
                    // updateSegment(selectedSegment, { ...segment, keyframes: [{ ...segment.keyframes[newKey]}] });
                    // setCurrentKey(newKey);
                }}
                ><span className="material-icons">circle</span></button>
               <button className={styles.keyframePrev}><span className="material-icons">keyboard_arrow_left</span></button>
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
                    value={segment.keyframes[selectedKeyframe].scaleX}
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
                    value={segment.keyframes[selectedKeyframe].scaleY}
                />
            </span>
        </div>
    );
}
