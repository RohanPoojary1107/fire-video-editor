import styles from "./actions.module.css";
import model from "../../model/model";

export default function Actions() {
  return (
    <div className={styles.container}>
      <button className={styles.button}>
        <span className="material-icons">save_alt</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">logout</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">layers</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">insert_drive_file</span>
      </button>
    </div>
  );
}
