import styles from "./controls.module.css";
import { useState } from "react";
import model from "../../model/model";

export default function Controls() {
  const [playing, setPlaying] = useState(false);
  const togglePlaying = () => {
    if (playing) {
      model.pause();
    } else {
      model.play();
      // model.project.segments[0].properties.x = -400;
    }

    setPlaying(model.playing);
  };

  return (
    <div className={styles.container}>
      <button className={styles.button}>
        <span className="material-icons">skip_previous</span>
      </button>
      <button className={styles.button} onClick={togglePlaying}>
        <span className="material-icons">
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">skip_next</span>
      </button>
      <input
        className={styles.trackbar}
        type="range"
        min="0"
        max="1"
        step={0.001}
      ></input>
      <button className={styles.button}>
        <span className="material-icons">volume_up</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">add</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">remove</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">undo</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">content_cut</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">delete</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">content_copy</span>
      </button>
    </div>
  );
}
