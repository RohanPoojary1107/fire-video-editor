import styles from "./elements.module.css";
import { useHistory } from "react-router-dom";
import { ChangeEvent } from "react";
import { Segment } from "../../model/types";


export default function Elements(props: any) {
  const history = useHistory();


  const changeX = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.selectedSegment != null) {
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
        track:  props.selectedSegment.track
      };
      console.log(segment.keyframes[0].x);
      console.log(props.selectedSegment);
      props.setSelectedSegment(segment);
    }
  };

  const changeY = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.selectedSegment != null) {
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
        track:  props.selectedSegment.track
      };
      props.setSelectedSegment(segment);
    }
  };

  const zoomHeight = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.selectedSegment != null) {
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
        track:  props.selectedSegment.track
      };
      console.log(segment.keyframes[0].scaleY);
      props.setSelectedSegment(segment);
    }
  };

  const zoomWidth = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.selectedSegment != null) {
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
        track: props.selectedSegment.track
      };
      console.log(segment.keyframes[0].scaleX);
      console.log(props.selectedSegment);
      props.setSelectedSegment(segment);
    }
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
          className = {styles.inputTag}
          type="number"
          step="10"
          placeholder="0"
          onChange={changeX}
        />
        </span>
        <span>
        <label className={styles.tags}>Y:</label>
        <input
          name="Y"
          className = {styles.inputTag}
          type="number"
          step="10"
          placeholder="0"
          onChange={changeY}
        />
        </span>

      <label className={styles.tags}>
        Zoom:
      </label>
      <span>
      <label className={styles.tags}>X:</label>
      <input
        name="height"
        className = {styles.inputTag}
        type="number"
        step="0.1"
        defaultValue="1.0"
        min="0.1"
        max="100.0"
        onChange={zoomHeight}
      />
      </span>
      <span>
      <label className={styles.tags}>Y:</label>
      <input
        name="width"
        className = {styles.inputTag}
        type="number"
        step="0.1"
        defaultValue="1.0"
        min="0.1"
        max="100.0"
        onChange={zoomWidth}
      />
      
      </span>
        
    </div>
  );
}
