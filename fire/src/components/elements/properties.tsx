import styles from "./properties.module.css";
import { ChangeEvent } from "react";
import { Segment } from "../../model/types";

export default function Properties(props: {
    selectedSegment: Segment,
    updateSegment: (oldSeg: Segment, segment: Segment) => void
}) {
    const changeX = (event: ChangeEvent<HTMLInputElement>) => {
        let segment: Segment = {
            media: props.selectedSegment.media,
            start: props.selectedSegment.start,
            duration: props.selectedSegment.duration,
            mediaStart: props.selectedSegment.mediaStart,
            texture: props.selectedSegment.texture,
            keyframes: [
                {
                    start: props.selectedSegment.keyframes[0].start,
                    x: +event.target.value,
                    y: props.selectedSegment.keyframes[0].y,
                    scaleX: props.selectedSegment.keyframes[0].scaleX,
                    scaleY: props.selectedSegment.keyframes[0].scaleY,
                },
            ],
        };
        props.updateSegment(props.selectedSegment, segment);
    };

    const changeY = (event: ChangeEvent<HTMLInputElement>) => {
        let segment: Segment = {
            media: props.selectedSegment.media,
            start: props.selectedSegment.start,
            duration: props.selectedSegment.duration,
            mediaStart: props.selectedSegment.mediaStart,
            texture: props.selectedSegment.texture,
            keyframes: [
                {
                    start: props.selectedSegment.keyframes[0].start,
                    x: props.selectedSegment.keyframes[0].x,
                    y: +event.target.value,
                    scaleX: props.selectedSegment.keyframes[0].scaleX,
                    scaleY: props.selectedSegment.keyframes[0].scaleY,
                },
            ],
        };
        props.updateSegment(props.selectedSegment, segment);
    };

    const zoomHeight = (event: ChangeEvent<HTMLInputElement>) => {

        let segment: Segment = {
            media: props.selectedSegment.media,
            start: props.selectedSegment.start,
            duration: props.selectedSegment.duration,
            mediaStart: props.selectedSegment.mediaStart,
            texture: props.selectedSegment.texture,
            keyframes: [
                {
                    start: props.selectedSegment.keyframes[0].start,
                    x: props.selectedSegment.keyframes[0].x,
                    y: props.selectedSegment.keyframes[0].y,
                    scaleX: props.selectedSegment.keyframes[0].scaleX,
                    scaleY: +event.target.value,
                },
            ],
        };
        props.updateSegment(props.selectedSegment, segment);

    };

    const zoomWidth = (event: ChangeEvent<HTMLInputElement>) => {

        let segment: Segment = {
            media: props.selectedSegment.media,
            start: props.selectedSegment.start,
            duration: props.selectedSegment.duration,
            mediaStart: props.selectedSegment.mediaStart,
            texture: props.selectedSegment.texture,
            keyframes: [
                {
                    start: props.selectedSegment.keyframes[0].start,
                    x: props.selectedSegment.keyframes[0].x,
                    y: props.selectedSegment.keyframes[0].y,
                    scaleX: +event.target.value,
                    scaleY: props.selectedSegment.keyframes[0].scaleY,
                },
            ],
        };
        props.updateSegment(props.selectedSegment, segment);
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
                    value={props.selectedSegment.keyframes[0].x}
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
                    value={props.selectedSegment.keyframes[0].y}
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
                    value={props.selectedSegment.keyframes[0].scaleX}
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
                    value={props.selectedSegment.keyframes[0].scaleY}
                />
            </span>
        </div>
    );
}
