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

        if(segment.keyframes.length > 1 && !checkKeyframeExists()){
            _updateSegment({ ...segment.keyframes[selectedKeyframe], scaleX: event.target.value});
        }else{
            updateSegment(selectedSegment, { ...segment, keyframes: [ 
                ...segment.keyframes.slice(0, selectedKeyframe), 
                { ...segment.keyframes[selectedKeyframe], x: +event.target.value }, 
                ...segment.keyframes.slice(selectedKeyframe+1)]});
        }
    }

    const changeY = (event: ChangeEvent<HTMLInputElement>) => {

        if(segment.keyframes.length > 1 && !checkKeyframeExists()){
            _updateSegment({ ...segment.keyframes[selectedKeyframe], scaleX: event.target.value});
        }else{
            updateSegment(selectedSegment, { ...segment, keyframes: [ 
                ...segment.keyframes.slice(0, selectedKeyframe), 
                { ...segment.keyframes[selectedKeyframe], y: +event.target.value, }, 
                ...segment.keyframes.slice(selectedKeyframe+1)]});
        }
    };

    const zoomHeight = (event: ChangeEvent<HTMLInputElement>) => {

        if(segment.keyframes.length > 1 && !checkKeyframeExists()){
            _updateSegment({ ...segment.keyframes[selectedKeyframe], scaleX: event.target.value});
        }else{
            updateSegment(selectedSegment, { ...segment, keyframes: [ 
                ...segment.keyframes.slice(0, selectedKeyframe), 
                { ...segment.keyframes[selectedKeyframe], scaleY: +event.target.value, }, 
                ...segment.keyframes.slice(selectedKeyframe+1)]});
        }
    };

    const zoomWidth = (event: ChangeEvent<HTMLInputElement>) => {

        if(segment.keyframes.length > 1 && !checkKeyframeExists()){
            _updateSegment({ ...segment.keyframes[selectedKeyframe], scaleX: event.target.value});
        }else{
            updateSegment(selectedSegment, { ...segment, keyframes: [ 
                ...segment.keyframes.slice(0, selectedKeyframe), 
                { ...segment.keyframes[selectedKeyframe], scaleX: +event.target.value, }, 
                ...segment.keyframes.slice(selectedKeyframe+1)]});
        }
    };

    const _updateSegment = (args: any) => {
        let insertPos = null;
        for(let i=0; i<segment.keyframes.length; i++){
            if(segment.keyframes[i].start + segment.start >= currentTime){
                insertPos = i;
                break;
            }
        }

        if(insertPos === null) insertPos = segment.keyframes.length;
        updateSegment(selectedSegment, 
            { ...segment, keyframes: [...segment.keyframes.slice(0, insertPos), 
                {
                    start: currentTime - segment.start, 
                    x: args.x == null ? 0 : args.x, 
                    y: args.y == null ? 0 : args.y, 
                    scaleX: args.scaleX == null ? 0 : args.scaleX,  
                    scaleY: args.scaleY == null ? 0 : args.scaleY 
                }, 
                ...segment.keyframes.slice(insertPos)]});

        setCurrentKey(insertPos);
    }

    const checkKeyframeExists = () => {
        for(let i=0; i<segment.keyframes.length; i++){
            if(segment.keyframes[i].start + segment.start === currentTime){
                return true;
            }
        }
        return false;
    }

    return (
        <div className={styles.container}>
            <label className={styles.pos}>
                Scaling Options:
        </label>
            <label className={styles.tags}>
                Position:
                <button 
                className={styles.keyframeNext} 
                onClick={() => {
                    console.log(Math.min(selectedKeyframe+1, segment.keyframes.length-1));
                    setCurrentKey(Math.min(selectedKeyframe+1, segment.keyframes.length-1));
                }}
                >
                    <span className="material-icons">keyboard_arrow_right</span>
                </button>
                <button className={styles.keyframeBtn} 
                onClick={(event) => {
                    event.stopPropagation();
                    _updateSegment({...segment.keyframes[selectedKeyframe]});
                }}
                ><span className="material-icons">circle</span></button>
               <button 
               className={styles.keyframePrev} 
               onClick={() => {
                   console.log(Math.max(selectedKeyframe-1, 0));
                   setCurrentKey(Math.max(selectedKeyframe-1, 0));
                }}>
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
                {/* <button className={styles.keyframeNext}><span className="material-icons">keyboard_arrow_right</span></button>
                <button className={styles.keyframeBtn} 
                onClick={(event) => {
                    event.stopPropagation();
                    _updateSegment({...segment.keyframes[selectedKeyframe]});
                }}
                ><span className="material-icons">circle</span></button>
               <button className={styles.keyframePrev}><span className="material-icons">keyboard_arrow_left</span></button> */}
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
                    min="0.0"
                    max="100.0"
                    onChange={zoomHeight}
                    value={segment.keyframes[selectedKeyframe].scaleY}
                />
            </span>
        </div>
    );
}
