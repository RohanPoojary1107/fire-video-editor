import styles from "./properties.module.css";
import { useEffect, useState } from "react";
import { Segment, SegmentID } from "../../model/types";
import { calculateProperties } from "../../utils/utils";

export default function Properties({
  trackList,
  selectedSegment,
  updateSegment,
  currentTime,
  setCurrentTime,
}: {
  currentTime: number;
  trackList: Segment[][];
  selectedSegment: SegmentID | null;
  updateSegment: (id: SegmentID, segment: Segment) => void;
  setCurrentTime: (timestamp: number) => void;
}) {
  const segment = !selectedSegment ? null : trackList[selectedSegment.track][selectedSegment.index];
  const currKeyframe = calculateProperties(segment, currentTime);

  // maintain state for keyframe buttons
  const [posState, setPositionState] = useState<boolean>(false);
  const [cropState, setCropState] = useState<boolean>(false);
  const [scaleState, setScaleState] = useState<boolean>(false);

  const checkKeyframeExists = () => {
    if (!segment) return false;

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
    if (!segment) return false;

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

  const _updateSegment = (args: any, property?: "position" | "scale" | "crop", isButtonPressed?: boolean) => {
    if (!segment || !selectedSegment) return false;

    let insertPos = null;
    for (let i = 0; i < segment.keyframes.length; i++) {
      if (segment.keyframes[i].start + segment.start >= currentTime) {
        insertPos = i;
        break;
      }
    }

    if (insertPos === null) insertPos = segment.keyframes.length;

    let currKeyframeIndex = checkKeyframeExists();

    if (segment.keyframes.length === 1 && isButtonPressed === undefined) {
      currKeyframeIndex = 0;
    }

    if(segment.keyframes.length > 1 && property === "position")setPositionState(true);
    else if(segment.keyframes.length > 1 && property === "scale")setScaleState(true);
    else if(segment.keyframes.length > 1 && property === "crop")setCropState(true);

    if (currKeyframeIndex !== false) {
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

  const findNextSetKeyframe = (property: "position" | "scale" | "crop") => {
    if (!segment) return null;

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
    if (!segment) return null;

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
    <fieldset className={`${styles.container} ${selectedSegment ? styles.slideIn : ""}`} disabled={selectedSegment === null}>
      <h2 className={styles.title}>Effects</h2>
      <label className={styles.tags}>
        Position
        <button
          className={styles.keyframeNext}
          onClick={() => {
            if (!segment) return;

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
            if (currentTime === 0) return;
            if (!posState) {
              _updateSegment({ x: currKeyframe.x, y: currKeyframe.y }, undefined, true);
            } else {
              _updateSegment({ x: undefined, y: undefined }, undefined, true);
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
            if (!segment) return;

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
      <span className={styles.effectBox}>
        <label className={styles.tag}>X </label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ x: (currKeyframe.x ?? 0) - 10 }, "position")}
          >-</button>
          <input
            name="X"
            className={styles.inputTag}
            type="number"
            step="10"
            onChange={event => _updateSegment({ x: +event.target.value }, "position")}
            value={currKeyframe.x}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ x: (currKeyframe.x ?? 0) + 10 }, "position")}
          >+</button>
        </div>
      </span>
      <span className={styles.effectBox}>
        <label className={styles.tag}>Y </label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ y: (currKeyframe.y ?? 0) - 10 }, "position")}
          >-</button>
          <input
            name="Y"
            className={styles.inputTag}
            type="number"
            step="10"
            onChange={event => _updateSegment({ y: +event.target.value }, "position")}
            value={currKeyframe.y}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ y: (currKeyframe.y ?? 0) + 10 }, "position")}
          >+</button>
        </div>
      </span>

      <label className={styles.tags}>
        Scale
        <button
          className={styles.keyframeNext}
          onClick={() => {
            if (!segment) return;

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
            if (currentTime === 0) return;
            if (!scaleState) {
              setScaleState(!scaleState);
              _updateSegment({
                scaleX: currKeyframe.scaleX,
                scaleY: currKeyframe.scaleY,
              }, undefined, true);
            } else {
              setScaleState(!scaleState);
              _updateSegment({ scaleX: undefined, scaleY: undefined }, undefined, true);
            }

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
            if (!segment) return;

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
      <span className={styles.effectBox}>
        <label className={styles.tag}>X </label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ scaleX: Math.max(+((currKeyframe.scaleX ?? 0) - 0.1).toFixed(2), 0)}, "scale")}
          >-</button>
          <input
            name="height"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0.0"
            onChange={(event) => _updateSegment({ scaleX: +event.target.value }, "scale")}
            value={currKeyframe.scaleX}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ scaleX: +((currKeyframe.scaleX ?? 0) + 0.1).toFixed(2) }, "scale")}
          >+</button>
        </div>
      </span>
      <span className={styles.effectBox}>
        <label className={styles.tag}>Y </label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ scaleY: Math.max(+((currKeyframe.scaleY ?? 0) - 0.1).toFixed(2), 0) }, "scale")}
          >-</button>
          <input
            name="width"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0.0"
            onChange={event => _updateSegment({ scaleY: +event.target.value }, "scale")}
            value={currKeyframe.scaleY}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ scaleY: +((currKeyframe.scaleY ?? 0) + 0.1).toFixed(2) }, "scale")}
          >+</button>
        </div>
      </span>

      <label className={styles.tags}>
        Crop
        <button
          className={styles.keyframeNext}
          onClick={() => {
            if (!segment) return;

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
            if (currentTime === 0) return;

            if (!cropState) {
              _updateSegment({
                trimLeft: currKeyframe.trimLeft,
                trimRight: currKeyframe.trimRight,
                trimTop: currKeyframe.trimTop,
                trimBottom: currKeyframe.trimBottom,
              }, undefined, true);
            } else {
              _updateSegment({
                trimLeft: undefined,
                trimRight: undefined,
                trimTop: undefined,
                trimBottom: undefined,
              }, undefined, true);
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
            if (!segment) return;

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
      <span className={styles.effectBox}>
        <label className={styles.tag}>Left</label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimLeft: Math.max(+((currKeyframe.trimLeft ?? 0) - 0.1).toFixed(2), 0) }, "crop")}
          >-</button>
          <input
            name="Left"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0"
            max="1.0"
            onChange={(event) => _updateSegment({ trimLeft: +event.target.value },"crop")}
            value={currKeyframe.trimLeft}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimLeft: Math.min(+((currKeyframe.trimLeft ?? 0) + 0.1).toFixed(2), 1) }, "crop")}
          >+</button>
        </div>
      </span>
      <span className={styles.effectBox}>
        <label className={styles.tag}>Right</label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimRight: Math.max(+((currKeyframe.trimRight ?? 0) - 0.1).toFixed(2), 0) }, "crop")}
          >-</button>
          <input
            name="Right"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0"
            max="1.0"
            onChange={event => _updateSegment({ trimRight: +event.target.value }, "crop")}
            value={currKeyframe.trimRight}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimRight: Math.min(+((currKeyframe.trimRight ?? 0) + 0.1).toFixed(2), 1) }, "crop")}
          >+</button>
        </div>
      </span>
      <span className={styles.effectBox}>
        <label className={styles.tag}>Top</label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimTop: Math.max(+((currKeyframe.trimTop ?? 0) - 0.1).toFixed(2), 0) }, "crop")}
          >-</button>
          <input
            name="Top"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0"
            max="1.0"
            onChange={event => _updateSegment({ trimTop: +event.target.value })}
            value={currKeyframe.trimTop}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimTop: Math.min(+((currKeyframe.trimTop ?? 0) + 0.1).toFixed(2), 1) }, "crop")}
          >+</button>
        </div>
      </span>
      <span className={styles.effectBox}>
        <label className={styles.tag}>Bottom</label>
        <div className={styles.inputTagBox}>
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimBottom: Math.max(+((currKeyframe.trimBottom ?? 0) - 0.1).toFixed(2), 0) }, "crop")}
          >-</button>
          <input
            name="Bottom"
            className={styles.inputTag}
            type="number"
            step="0.1"
            min="0"
            max="1.0"
            onChange={event => _updateSegment({ trimBottom: +event.target.value })}
            value={currKeyframe.trimBottom}
          />
          <button
            className={styles.inputBtn}
            onClick={() => _updateSegment({ trimBottom: Math.min(+((currKeyframe.trimBottom ?? 0) + 0.1).toFixed(2), 1) }, "crop")}
          >+</button>
        </div>
      </span>
    </fieldset>
  );
}
