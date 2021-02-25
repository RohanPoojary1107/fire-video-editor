import styles from "./mediaPlayer.module.css";
import { useEffect, useRef } from "react";

export default function MediaPlayer({canvasRef, projectWidth, projectHeight}: {canvasRef: HTMLCanvasElement, projectWidth: number, projectHeight: number}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // setTimeout(() => {
      // canvasRef.style.maxWidth = "100%";
      // canvasRef.style.maxHeight = "100%";
      canvasRef.classList.add(styles.canvas);
      //@ts-ignore
      canvasRef.style.aspectRatio = `${projectWidth / projectHeight}`;
      // canvasRef.style.background = "black";
      console.log(canvasRef.style.width);
      ref.current?.appendChild(canvasRef);
    // }, 0);
  });

  return (
    <div className={styles.container} ref={ref}>
    </div>
  );
}

// export default function MediaPlayer({canvasRef, projectWidth, projectHeight}: {canvasRef: (canvas: HTMLCanvasElement) => void, projectWidth: number, projectHeight: number}) {
//   return (
//     <div className={styles.container} >
//       <canvas className={styles.canvas} style={{aspectRatio: `${projectWidth / projectHeight}`}} ref={canvasRef}></canvas>
//     </div>
//   );
// }
