import styles from "./editor.module.css";
import MediaPool from "../components/mediaPool/mediaPool";
import Controls from "../components/controls/controls";
import MediaPlayer from "../components/mediaPlayer/mediaPlayer";
import Actions from "../components/actions/actions";
import Timeline from "../components/timeline/timeline";
import { Media, Segment, SegmentID } from "../model/types";
import { WebGLRenderer } from "../model/webgl";
import Properties from "../components/elements/properties";

export default function Editor(props: {
  canvasRef: HTMLCanvasElement,
  mediaList: Media[],
  setMediaList: (mediaList: Media[]) => void,
  trackList: Segment[][],
  setTrackList: (segments: Segment[][]) => void,
  addVideo: (file: File[]) => void,
  deleteVideo: (media: Media) => void,
  playVideo: () => void,
  pauseVideo: () => void,
  projectWidth: number,
  projectHeight: number,
  renderer: WebGLRenderer,
  projectFrameRate: number,
  projectDuration: number,
  isPlaying: boolean,
  currentTime: number,
  setCurrentTime: (timestamp: number) => void,
  dragAndDrop: (timestamp: number, media: Media, trackNum: number) => void,
  selectedSegment: SegmentID | null,
  setSelectedSegment: (selected: SegmentID | null) => void,
  updateSegment: (id: SegmentID, segment: Segment) => void,
  splitVideo: (timestamp: number) => void,
  deleteSelectedSegment: () => void
}) {
  return (
    <div className={styles.container}>
      <MediaPool
        mediaList={props.mediaList}
        setMediaList={props.setMediaList}
        addVideo={props.addVideo}
        deleteVideo={props.deleteVideo}
        dragAndDrop={props.dragAndDrop}
        projectDuration={props.projectDuration}
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
        currentTime={props.currentTime}
        projectDuration={props.projectDuration}
        setCurrentTime={props.setCurrentTime}
        deleteSelectedSegment={props.deleteSelectedSegment}
        splitVideo={props.splitVideo}
      />
      {props.selectedSegment !== null ?
        <Properties
          trackList={props.trackList}
          selectedSegment={props.selectedSegment}
          currentTime={props.currentTime}
          setCurrentTime={props.setCurrentTime}
          updateSegment={props.updateSegment}
        /> : ""}
      <Timeline
        trackList={props.trackList}
        projectDuration={props.projectDuration}
        selectedSegment={props.selectedSegment}
        setSelectedSegment={props.setSelectedSegment}
        currentTime={props.currentTime}
        setCurrentTime={props.setCurrentTime}
        updateSegment={props.updateSegment}
      />
      <Actions></Actions>
    </div>
  );
}
