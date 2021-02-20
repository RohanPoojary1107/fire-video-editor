import styles from "./timeline.module.css";
import CSS from 'csstype';
import { useRef, useState } from 'react';

export default function Timeline(this: any) {

  const [pointerOffset, setPointer] = useState<number>(0);
  const [mouseOffset, setMouse] = useState<number>(0);
  const [originalMouse, setOriginalMouse] = useState<number>(0);
  const [ActivelyHolding, setActivelyHolding] = useState<number>(0);
  const setHeight = useRef<HTMLDivElement>(null);
  let timeLineCount=0;
  
  function ruler(seconds:number, offset:number, size:number) {
    let time = seconds>0 ? seconds:5*60;
    let rows = [];

    timeLineCount=size;

    for (let i=0;i<size;i++){
      let timer = parseFloat(((i*(time/size))+offset).toFixed(2));
      let min = '00';
      if (((timer/1)>>0)<10){
        min = '0' + ((timer/1)>>0).toFixed(0);
      }
      else{
        min = '' + ((timer/1)>>0).toFixed(0);
      }
      let sec = '00';
      if (((timer%1)*100)<10){
        sec = '0' + ((timer%1)*100).toFixed(0);
      }
      else{
        sec = '' + ((timer%1)*100).toFixed(0);
      }
      rows.push(
        <span className={styles.time} key={timer} onDoubleClick={() => {setPointer(i); setMouse(-1)}}>
          {min}:{sec}
        </span>
      );
    }
    return rows;
}

function pointer() {
  let height = 300;
  let width = 1620;
  let offset = 0;
  if(setHeight.current){
    height = setHeight.current?.clientHeight;
    width = setHeight.current?.clientWidth;
  }
  if(mouseOffset==-1){
    offset = pointerOffset*((width/timeLineCount)-1.5);
  }
  else{
    offset = mouseOffset;
  }
  
  const pointerStyle: CSS.Properties = {
    height: 'calc(' + height +'px - 45px)',
    transform: 'translateX('+ offset +'px)'
  }
  return(
    <div style={pointerStyle} className={styles.pointer}>
    <div className={styles.highlight}></div>
    <div className={styles.indicator}></div>
    </div>
  )
}

  return (
    <div ref={setHeight} className={styles.container}>
      <div className={styles.timebar}>
        {ruler(5,1,20)}
        {pointer()}
      </div>
    </div>
  );
}