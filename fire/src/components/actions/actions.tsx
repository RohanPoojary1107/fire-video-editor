import styles from "./actions.module.css";
import model from "../../model/model";
import { useHistory } from "react-router-dom";

export default function Actions() {
  const history = useHistory();
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
      <button className={styles.button} onClick={() => history.push("/about")}>
        <span className="material-icons">help_outline</span>
      </button>
    </div>
  );
}
