import { Link } from "react-router-dom";
import styles from "./exportPage.module.css";

declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

export default function ExportPage(props: any) {
  return (
    <div className={styles.container}>
      <div>
        <p>
          <Link to="/">
            <img className={styles.logo} src="/logo192.png" />
          </Link>
          Fire
        </p>
        <p>Video Editor</p>
      </div>
      <div className={styles.downloadButton}>
        <button className={styles.button}>
          <span className="material-icons" onClick={props.Render}>
            download
          </span>
        </button>
      </div>
    </div>
  );
}
