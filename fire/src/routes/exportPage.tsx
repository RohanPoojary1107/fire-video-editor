import { Link } from "react-router-dom";
import styles from "./exportPage.module.css";

export default function ExportPage() {
    return (
        <div className={styles.container}>
            <div>
                <p><Link to="/"><img className = {styles.logo} src="/logo192.png"/></Link>Fire</p>
                <p>Video Editor</p>
            </div>
            <div className={styles.downloadButton}>
                <button className={styles.button}>
                <span className="material-icons">download</span>
                </button>          
            </div>
        </div>);
}

