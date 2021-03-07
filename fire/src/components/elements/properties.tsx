import styles from "./properties.module.css";
import { ChangeEvent, useEffect, useState } from "react";
import { Segment, SegmentID } from "../../model/types";
import { calculateProperties } from "../../utils/interpolation";

export default function Properties({
  trackList,
  selectedSegment,
  updateSegment,
  currentTime,
  setCurrentTime,
}: {
  currentTime: number;
  trackList: Segment[][];
  selectedSegment: SegmentID;
  updateSegment: (id: SegmentID, segment: Segment) => void;
  setCurrentTime: (timestamp: number) => void;
}) {
  const segment = trackList[selectedSegment.track][selectedSegment.index];
  
  // maintain state for keyframe buttons
  const [posState, setPositionState] = useState<boolean>(false);
  const [cropState, setCropState] = useState<boolean>(false);
  const [scaleState, setScaleState] = useState<boolean>(false);

  const checkKeyframeExists = () => {
    for (let i = 0; i < segment.keyframes.length; i++) {
      if (segment.keyframes[i].start + segment.start === currentTime) {
        return i; // return index of keyframe if it exists
      }
    }
    return false;
  };

  const checkPropState = (property: string): boolean => {
    let currKeyframeIndex = checkKeyframeExists();
    if (currKeyframeIndex === false) return false;

    if (property === "position") {
      if (
        segment.keyframes[currKeyframeIndex].x !== undefined ||
        segment.keyframes[currKeyframeIndex].y !== undefined
      )
        return true;
    } else if (property === "scale") {
      if (
        segment.keyframes[currKeyframeIndex].scaleX !== undefined ||
        segment.keyframes[currKeyframeIndex].scaleY !== undefined
      )
        return true;
    } else if (property === "crop") {
      if (
        segment.keyframes[currKeyframeIndex].trimBottom !== undefined ||
        segment.keyframes[currKeyframeIndex].trimTop !== undefined ||
        segment.keyframes[currKeyframeIndex].trimLeft !== undefined ||
        segment.keyframes[currKeyframeIndex].trimRight !== undefined
      )
        return true;
    }
    return false;
  };

  useEffect(() => {
    setPositionState(checkPropState("position"));
    setCropState(checkPropState("crop"));
    setScaleState(checkPropState("scale"));
  }, [currentTime]);

  const _updateSegment = (args: any) => {
    let insertPos = null;
    for (let i = 0; i < segment.keyframes.length; i++) {
      if (segment.keyframes[i].start + segment.start >= currentTime) {
        insertPos = i;
        break;
      }
    }

    if (insertPos === null) insertPos = segment.keyframes.length;

    const currKeyframeIndex = checkKeyframeExists();
    if (currKeyframeIndex) {
      let updatedKeyframe = {
        ...segment.keyframes[currKeyframeIndex],
        ...args,
      };

      let toDelete = true;
      for (const [key, value] of Object.entries(updatedKeyframe)) {
        if (key !== "start" && value !== undefined) {
          toDelete = false;
          break;
        }
      }

      if (toDelete) {
        // if user has unset all properties for current keyframe.
        updateSegment(selectedSegment, {
          ...segment,
          keyframes: [
            ...segment.keyframes.slice(0, currKeyframeIndex),
            ...segment.keyframes.slice(currKeyframeIndex + 1),
          ],
        });
      } else {
        updateSegment(selectedSegment, {
          ...segment,
          keyframes: [
            ...segment.keyframes.slice(0, currKeyframeIndex),
            updatedKeyframe,
            ...segment.keyframes.slice(currKeyframeIndex + 1),
          ],
        });
      }
    } else {
      // If no keyframe exists at currentTime
      updateSegment(selectedSegment, {
        ...segment,
        keyframes: [
          ...segment.keyframes.slice(0, insertPos),
          {
            start: currentTime - segment.start,
            x: args.x,
            y: args.y,
            scaleX: args.scaleX,
            scaleY: args.scaleY,
            trimLeft: args.trimLeft,
            trimRight: args.trimRight,
            trimTop: args.trimTop,
            trimBottom: args.trimBottom,
          },
          ...segment.keyframes.slice(insertPos),
        ],
      });
    }
  };

  const getInterpolatedKeyframe = () => {
    return calculateProperties(segment, currentTime);
  };

  const findNextSetKeyframe = (property: "position" | "scale" | "crop") => {
    for (let i = 0; i < segment.keyframes.length; i++) {
      //@ts-ignore
      if (segment.start + segment.keyframes[i].start > currentTime) {
        if (property === "position") {
          if (
            segment.keyframes[i].x !== undefined ||
            segment.keyframes[i].y !== undefined
          )
            return i;
        } else if (property === "scale") {
          if (
            segment.keyframes[i].scaleX !== undefined ||
            segment.keyframes[i].scaleY !== undefined
          )
            return i;
        } else if (property === "crop") {
          if (
            segment.keyframes[i].trimBottom !== undefined ||
            segment.keyframes[i].trimTop !== undefined ||
            segment.keyframes[i].trimLeft !== undefined ||
            segment.keyframes[i].trimRight !== undefined
          )
            return i;
        }
      }
    }
    return null;
  };

  const findPrevSetKeyframe = (property: "position" | "scale" | "crop") => {
    for (let i = segment.keyframes.length - 1; i >= 0; i--) {
      //@ts-ignore
      if (segment.start + segment.keyframes[i].start < currentTime) {
        if (property === "position") {
          if (
            segment.keyframes[i].x !== undefined ||
            segment.keyframes[i].y !== undefined
          )
            return i;
        } else if (property === "scale") {
          if (
            segment.keyframes[i].scaleX !== undefined ||
            segment.keyframes[i].scaleY !== undefined
          )
            return i;
        } else if (property === "crop") {
          if (
            segment.keyframes[i].trimBottom !== undefined ||
            segment.keyframes[i].trimTop !== undefined ||
            segment.keyframes[i].trimLeft !== undefined ||
            segment.keyframes[i].trimRight !== undefined
          )
            return i;
        }
      }
    }
    return null; // if no previous keyframe exists with the given property set
  };

  return (
    <div className={styles.container}>
      <label className={styles.pos}>Scaling Options:</label>
      <label className={styles.tags}>
        Position:
        <button
          className={styles.keyframeNext}
          onClick={() => {
            let nextKeyframeIndex = findNextSetKeyframe("position");
            setCurrentTime(
              nextKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[nextKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_right</span>
        </button>
        <button
          className={styles.keyframeBtn}
          onClick={(event) => {
            event.stopPropagation();
            const currKeyframe = getInterpolatedKeyframe();
            if (!posState) {
              _updateSegment({ x: currKeyframe.x, y: currKeyframe.y });
            } else {
              _updateSegment({ x: undefined, y: undefined });
            }
            setPositionState(!posState);
          }}
        >
          <span
            className="material-icons"
            style={{ color: posState ? "red" : "rgb(102, 102, 102)" }}
          >
            circle
          </span>
        </button>
        <button
          className={styles.keyframePrev}
          onClick={() => {
            let prevKeyframeIndex = findPrevSetKeyframe("position");
            setCurrentTime(
              prevKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[prevKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_left</span>
        </button>
      </label>
      <span>
        <label className={styles.tags}>X:</label>
        <input
          name="X"
          className={styles.inputTag}
          type="number"
          step="10"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ x: event.target.value })
          }
          value={getInterpolatedKeyframe().x}
        />
      </span>
      <span>
        <label className={styles.tags}>Y:</label>
        <input
          name="Y"
          className={styles.inputTag}
          type="number"
          step="10"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ y: event.target.value })
          }
          value={getInterpolatedKeyframe().y}
        />
      </span>

      <label className={styles.tags}>
        Scale:
        <button
          className={styles.keyframeNext}
          onClick={() => {
            let nextKeyframeIndex = findNextSetKeyframe("scale");
            setCurrentTime(
              nextKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[nextKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_right</span>
        </button>
        <button
          className={styles.keyframeBtn}
          onClick={(event) => {
            event.stopPropagation();
            const currKeyframe = getInterpolatedKeyframe();
            if (!scaleState) {
              _updateSegment({
                scaleX: currKeyframe.scaleX,
                scaleY: currKeyframe.scaleY,
              });
            } else {
              _updateSegment({ scaleX: undefined, scaleY: undefined });
            }
            setScaleState(!scaleState);
          }}
        >
          <span
            className="material-icons"
            style={{ color: scaleState ? "red" : "rgb(102, 102, 102)" }}
          >
            circle
          </span>
        </button>
        <button
          className={styles.keyframePrev}
          onClick={() => {
            let prevKeyframeIndex = findPrevSetKeyframe("scale");
            setCurrentTime(
              prevKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[prevKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_left</span>
        </button>
      </label>
      <span>
        <label className={styles.tags}>X:</label>
        <input
          name="height"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0.0"
          max="100.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ scaleX: event.target.value })
          }
          value={getInterpolatedKeyframe().scaleX}
        />
      </span>
      <span>
        <label className={styles.tags}>Y:</label>
        <input
          name="width"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0.0"
          max="100.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ scaleY: event.target.value })
          }
          value={getInterpolatedKeyframe().scaleY}
        />
      </span>

      <label className={styles.tags}>
        Crop:
        <button
          className={styles.keyframeNext}
          onClick={() => {
            let nextKeyframeIndex = findNextSetKeyframe("crop");
            setCurrentTime(
              nextKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[nextKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_right</span>
        </button>
        <button
          className={styles.keyframeBtn}
          onClick={(event) => {
            event.stopPropagation();
            const currKeyframe = getInterpolatedKeyframe();
            if (!cropState) {
              _updateSegment({
                trimLeft: currKeyframe.trimLeft,
                trimRight: currKeyframe.trimRight,
                trimTop: currKeyframe.trimTop,
                trimBottom: currKeyframe.trimBottom,
              });
            } else {
              _updateSegment({
                trimLeft: undefined,
                trimRight: undefined,
                trimTop: undefined,
                trimBottom: undefined,
              });
            }
            setCropState(!cropState);
          }}
        >
          <span
            className="material-icons"
            style={{ color: cropState ? "red" : "rgb(102, 102, 102)" }}
          >
            circle
          </span>
        </button>
        <button
          className={styles.keyframePrev}
          onClick={() => {
            let prevKeyframeIndex = findPrevSetKeyframe("crop");
            setCurrentTime(
              prevKeyframeIndex == null
                ? currentTime
                : segment.start + segment.keyframes[prevKeyframeIndex].start
            );
          }}
        >
          <span className="material-icons">keyboard_arrow_left</span>
        </button>
      </label>
      <span>
        <label className={styles.tags}>Left:</label>
        <input
          name="Left"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0"
          max="1.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ trimLeft: event.target.value })
          }
          value={getInterpolatedKeyframe().trimLeft}
        />
      </span>
      <span>
        <label className={styles.tags}>Right:</label>
        <input
          name="Right"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0"
          max="1.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ trimRight: event.target.value })
          }
          value={getInterpolatedKeyframe().trimRight}
        />
      </span>
      <span>
        <label className={styles.tags}>Top:</label>
        <input
          name="Top"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0"
          max="1.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ trimTop: event.target.value })
          }
          value={getInterpolatedKeyframe().trimTop}
        />
      </span>
      <span>
        <label className={styles.tags}>Bottom:</label>
        <input
          name="Bottom"
          className={styles.inputTag}
          type="number"
          step="0.1"
          min="0"
          max="1.0"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            _updateSegment({ trimBottom: event.target.value })
          }
          value={getInterpolatedKeyframe().trimBottom}
        />
      </span>
    </div>
  );
}
