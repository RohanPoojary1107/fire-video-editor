import styles from "./editor.module.css";
import MediaPool from "../components/mediaPool/mediaPool";
import Controls from "../components/controls/controls";
import MediaPlayer from "../components/mediaPlayer/mediaPlayer";
import Actions from "../components/actions/actions";
import Timeline from "../components/timeline/timeline";

export default function Editor(props: any) {
  return (
    <div className={styles.container}>
      <MediaPool 
      mediaList={props.mediaList} 
      setMediaList={props.setMediaList} 
      addVideo={props.addVideo} 
      deleteVideo={props.deleteVideo}
      previewVideo={props.previewVideo}
      dragAndDrop={props.dragAndDrop}
      />
      <MediaPlayer
      canvasRef={props.canvasRef}
      projectWidth={props.projectWidth}
      projectHeight={props.projectHeight}
      />
      <Controls 
      playVideo={props.playVideo}
      pauseVideo={props.pauseVideo}
      isPlaying={props.isPlaying}
      deleteSelectedSegment={props.deleteSelectedSegment}
      />
      <Timeline videos={props.trackList[0]}></Timeline>
      <Actions></Actions>
    </div>
  );
}
