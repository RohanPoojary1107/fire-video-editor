import styles from "./editor.module.css";
import MediaPool from "../components/mediaPool/mediaPool";
import Controls from "../components/controls/controls";
import MediaPlayer from "../components/mediaPlayer/mediaPlayer";
import Actions from "../components/actions/actions";
import Timeline from "../components/timeline/timeline";

export default function Editor() {
  return (
    <div className={styles.container}>
        <MediaPool />
      <MediaPlayer></MediaPlayer>
      <Controls />
      <Timeline></Timeline>
      <Actions></Actions>
    </div>
  );
}
