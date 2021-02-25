import styles from "./controls.module.css";

export default function Controls({playVideo, pauseVideo, isPlaying, deleteSelectedSegment}: {playVideo:any, pauseVideo:any, isPlaying: boolean, deleteSelectedSegment:any}) {
  // const [playing, setPlaying] = useState(false);
  const togglePlaying = () => {
    if (isPlaying) {
      // model.pause();
      pauseVideo();
    } else {
      playVideo();
    }

    // setPlaying(model.playing);
  };

  return (
    <div className={styles.container}>
      <button className={styles.button}>
        <span className="material-icons">skip_previous</span>
      </button>
      <button className={styles.button} onClick={togglePlaying}>
        <span className="material-icons">
          {isPlaying ? "pause" : "play_arrow"}
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
        <span className="material-icons">arrow_back</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">arrow_forward</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">undo</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">content_cut</span>
      </button>
      <button className={styles.button} onClick={deleteSelectedSegment}>
        <span className="material-icons">delete</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">content_copy</span>
      </button>
    </div>
  );
}
