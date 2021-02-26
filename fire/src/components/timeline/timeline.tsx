import styles from "./timeline.module.css";
import CSS from "csstype";
import { Segment } from "../../model/types";
import { useRef, useState } from "react";

export default function Timeline(props: any) {
  const [pointerOffset, setPointer] = useState<number>(0);
  const [mouseOffset, setMouse] = useState<number>(0);
  const [scrollX, setScrollX] = useState<number>(0);
  const [screenOffset, setScreenOffset] = useState<number>(0);
  const [draggedOn, setDraggedOn] = useState<String>("");
  const setTimeLine = useRef<HTMLDivElement>(null);
  const setFirstLine = useRef<HTMLDivElement>(null);

  const DEFAULT_SECONDS_RULER = 60;
  const RULER_EXTRA_PIXEL = 10;
  const SECONDS_LENGTH = 5;
  const SECONDS_CHUNKS = 10;

  //@ts-ignore
  const handleOnScoll = async (e) => {
    if (setFirstLine.current) {
      setScrollX(setFirstLine.current.getBoundingClientRect().left);
      if (screenOffset === 0) {
        setScreenOffset(scrollX);
      }
    }
  };

  function padNumber(number: number, size: number) {
    var s = String(number);
    while (s.length < (size || 2)) {
      s = "0" + s;
    }
    return s;
  }

  function ruler(seconds: number) {
    let secondsLength = seconds > 0 ? seconds : DEFAULT_SECONDS_RULER;
    let rows = [];
    let second = 10;
    do {
      let currentMinute = Math.floor(second / 60);
      let currentSecond = second - currentMinute * 60;
      rows.push(
        `${padNumber(currentMinute, 2)}:${padNumber(currentSecond, 2)}`
      );
      second = second + 10;
    } while (second <= seconds);
    return (
      <div className={styles.rulerCon}>
        <div
          className={styles.ruler}
          style={{
            width:
              rows.length * SECONDS_CHUNKS * SECONDS_LENGTH + RULER_EXTRA_PIXEL,
          }}
        >
          {rows.map((second, index) => (
            <div
              className={styles.s10}
              key={second}
              onDoubleClick={() => {
                setPointer(index * 50);
                setMouse(-1);
              }}
            >
              <span className={styles.time}>{second}</span>
              <div className={styles.sec}></div>

              <div className={styles.sec}></div>
              <div className={styles.sec}></div>
              <div className={styles.sec}></div>
              <div className={styles.sec}></div>
              {index === 0 ? (
                <div
                  ref={setFirstLine}
                  className={styles.sec}
                  style={{ height: 12 }}
                ></div>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function pointer() {
    let height = 240;
    let width = 1620;
    let offset = 0;
    if (setTimeLine.current) {
      height = setTimeLine.current?.clientHeight;
      width = setTimeLine.current?.clientWidth;
    }
    if (mouseOffset === -1) {
      if (pointerOffset === 0) {
        offset = 1;
      } else {
        offset = pointerOffset;
      }
    } else {
      offset = mouseOffset;
    }

    const pointerStyle: CSS.Properties = {
      height: "calc(" + height + "px + 30px)",
      transform: "translateX(" + (offset + scrollX - screenOffset - 1) + "px)",
    };
    return (
      <div style={pointerStyle} className={styles.pointer}>
        <div className={styles.highlight}></div>
        <div className={styles.indicator}></div>
      </div>
    );
  }

  function frame(segment: Segment) {
    let duration = segment.duration;
    return (
      <li
        className={`${styles.card}`}
        key={segment.media.file.name}
        style={{ width: duration * 5 }}
        onDoubleClick={() => props.setSelectedSegment(segment)}
      >
        <img
          className={styles.img}
          src={segment.media.thumbnail}
          alt={segment.media.file.name}
        />
      </li>
    );
  }

  function frames(segmentList: Segment[]) {
    return (
      <ul className={styles.frames}>
        {segmentList.map((segment) => {
          return frame(segment);
        })}
      </ul>
    );
  }

  const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOn("");

    console.log(props.videos);

    if (!e.dataTransfer) return;

    for (const item of Object.values(e.dataTransfer.items)) {
      console.log(item);
    }
  };

  return (
    <div
      ref={setTimeLine}
      className={styles.container}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggedOn("draggedOn");
      }}
      onDragEnter={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggedOn("draggedOn");
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggedOn("");
      }}
      onDrop={onDrag}
      onScroll={handleOnScoll}
    >
      <div className={styles.timebar}>
        {ruler(360)}
        {pointer()}
      </div>

      {frames(props.videos)}
    </div>
  );
}
