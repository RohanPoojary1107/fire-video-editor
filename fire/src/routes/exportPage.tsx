import { Link } from "react-router-dom";
import styles from "./exportPage.module.css";
import { useState } from "react";

declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

export default function ExportPage(props: any) {
  const [load, setLoad] = useState<number>(0);

  function AddProject() {
    if (props.trackList.length > 1) {
      var segment;
      for (var i = 0; i < props.trackList.length; i++) {
        if (props.trackList[i].length > 0) {
          segment = props.trackList[i][0];
        }
      }

      setLoad(0);
      if (props.isRecordingRef.current)
        setLoad(Math.round((100 * props.currentTime) / props.projectDuration));

      return (
        <div className={styles.mediaList}>
          <ul className={styles.card}>
            <li>
              <div
                style={{
                  backgroundImage: `url(${segment.media.thumbnail})`,
                }}
                className={styles.imageProperties}
              ></div>
              <h3>Untitled</h3>
              <div className={styles.process}>
                <label className={styles.render}>Rendering Progress</label>
                <progress
                  max="100"
                  value={load}
                  className={styles.progressBar}
                ></progress>
                <label className={styles.label}>{load}%</label>
              </div>
            </li>
          </ul>
        </div>
      );
    }
    return <div>No project to export</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.vbar}>
          <Link to="/">
            <img className={styles.logo} src="/logo192.png" />
          </Link>
          <div>
            <h1>Fire</h1>
            <p>Video Editor</p>
          </div>
        </div>
        <Link to="/projects" className={styles.btn}>
          <span className="material-icons">layers</span> Current Projects
        </Link>
        <Link to="/export" className={styles.active}>
          <span className="material-icons">save_alt</span> Exported Files
        </Link>
      </div>
      <button className={styles.downlaod}>
        <span className="material-icons" onClick={props.Render}>
          save_alt
        </span>
      </button>
      <div className={styles.main}>
        <AddProject />
      </div>
    </div>
  );
}
