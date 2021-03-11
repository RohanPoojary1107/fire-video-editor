import { Link } from "react-router-dom";
import Properties from "../components/elements/properties";
import styles from "./exportPage.module.css";
import React, { useState } from 'react';

declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}



export default function ExportPage(props: any) {
  
  const [load, setLoad] = useState<number>(0);
  
  function AddProject() {

    if(props.trackList.length > 1){
      var segment;
      for (var i = 0;i<props.trackList.length;i++){
        if(props.trackList[i].length > 0 ){
            segment = props.trackList[i][0];
        }
      }

       
      
      
      return(
        <div className={styles.mediaList}>
        <ul className={styles.card}>
          <li><img src={segment.media.thumbnail} className={styles.imageProperties}></img>Untitled<label className={styles.render}>Rendering Progress:</label><progress max="100" value={load} className={styles.progressBar}></progress><label className={styles.label}>{load}%</label></li>
        </ul>
        </div>
      );
    }
    return(
      <div>No project to export</div>
    );
    
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.vbar}>
        <p>
          <Link to="/">
            <img className={styles.logo} src="/logo192.png"/>
          </Link>
          Fire
        </p>
        <p>Video Editor</p>
      </div>
      <div className={styles.downloadButton}>
        <button>
          <span className="material-icons" onClick={props.Render}>
            download
          </span>
        </button>
      </div>
      <AddProject/>
    </div>
  );
}
