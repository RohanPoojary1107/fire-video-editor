import { Link, useHistory } from "react-router-dom";
import styles from "./projects.module.css";

export default function Projects() {
    const history = useHistory();
    return (
        <div className={styles.container}>

            <div className={styles.sidebar}>
                <div className={styles.vbar}>
                    <Link to="/">
                        <img className={styles.logo} src="/logo192.png"/>
                    </Link>
                    <div>
                        <h1>Fire</h1>
                        <p>Video Editor</p>
                    </div>
                </div>
                <Link to="/projects" className={styles.active}>
                    <span className="material-icons">layers</span> Current Projects
                </Link>
                <Link to="/export" className={styles.btn}>
                    <span className="material-icons">save_alt</span> Exported Files
                </Link>
            </div>

            <div className={styles.main}>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

                <div className={styles.projectBox} style={{
                            backgroundImage: `url()`
                        }}>
                           <h2>Project Name</h2> 
                </div>

            </div>

            <button className={styles.new} onClick={() => history.push("/")}>
            <span className="material-icons">add</span>
            </button>

        </div>);
}
