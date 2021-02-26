import styles from "./mediaPlayer.module.css";
import { useEffect, useRef } from "react";

export default function MediaPlayer(
    {
        canvasRef,
        projectWidth,
        projectHeight
    }:
        {
            canvasRef: HTMLCanvasElement,
            projectWidth: number,
            projectHeight: number
        }
) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        canvasRef.classList.add(styles.canvas);
        //@ts-ignore
        canvasRef.style.aspectRatio = `${projectWidth / projectHeight}`;
        ref.current?.appendChild(canvasRef);
    }, []);

    return (
        <div className={styles.container} ref={ref}>
        </div>
    );
}