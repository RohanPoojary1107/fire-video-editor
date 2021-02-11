import styles from "./mediaPlayer.module.css";
import { useEffect, useRef } from "react";
import model from "../../model/model";

export default function MediaPlayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      model.canvas.style.maxWidth = "100%";
      model.canvas.style.maxHeight = "100%";
      //@ts-ignore
      model.canvas.style.aspectRatio = `${model.project.width / model.project.height}`;
      model.canvas.style.background = "black";
      console.log(model.canvas.style.width);
      ref.current?.appendChild(model.canvas);
    }, 0);
  });

  return (
    <div className={styles.container} ref={ref}>
    </div>
  );
}
