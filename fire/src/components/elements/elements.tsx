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
            width: props.selectedSegment.keyframes[0].width,
            height: props.selectedSegment.keyframes[0].height,
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
            width: props.selectedSegment.keyframes[0].width,
            height: props.selectedSegment.keyframes[0].height,
          },
        ],
        track:  props.selectedSegment.track
      };
      props.setSelectedSegment(segment);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <label htmlFor="X" className={styles.pos}>
          Position:
        </label>
        <input
          name="X"
          id="XCoord"
          type="number"
          step="10"
          placeholder="0"
          onChange={changeX}
        />
        <input
          name="Y"
          id="YCoord"
          type="number"
          step="10"
          placeholder="0"
          onChange={changeY}
        />
      </div>
    </div>
  );
}
