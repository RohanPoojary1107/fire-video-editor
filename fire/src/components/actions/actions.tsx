import styles from "./actions.module.css";
import { useHistory } from "react-router-dom";

export default function Actions() {
  const history = useHistory();
  return (
    <div className={styles.container}>
      <button className={styles.button}>
        <img className={styles.logo} src="/logo192.png"/>
        </button>
      <button className={styles.button} title="Save">
        <span className="material-icons">save_alt</span>
      </button>
      <button className={styles.button} title="Login">
        <span className="material-icons" onClick={() => history.push("/exportPage")}>login</span>
      </button>
      <button className={styles.button} title="Layers">
        <span className="material-icons">layers</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">insert_drive_file</span>
      </button>
      <button className={styles.button} onClick={() => history.push("/about")} title="About">
        <span className="material-icons">help_outline</span>
      </button>
      <button className={styles.button}>
        <span className="material-icons">tonality</span>
      </button>
    </div>
  );
}
