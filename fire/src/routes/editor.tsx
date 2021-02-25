import styles from "./editor.module.css";
import MediaPool from "../components/mediaPool/mediaPool";
import Controls from "../components/controls/controls";
import MediaPlayer from "../components/mediaPlayer/mediaPlayer";
import Actions from "../components/actions/actions";
import Timeline from "../components/timeline/timeline";
import { Media } from "../model/types";
import { useRef, useState } from 'react';

export default function Editor({ files, setTimelineFiles }: {
  files: Media[],
  setTimelineFiles: Function
}) {
  return (
    <div className={styles.container}>
      <MediaPool handler={setTimelineFiles} />
      <MediaPlayer></MediaPlayer>
      <Controls />
      <Timeline videos={files}></Timeline>
      <Actions></Actions>
    </div>
  );
}
