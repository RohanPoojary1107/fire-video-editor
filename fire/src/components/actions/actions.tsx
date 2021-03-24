import styles from "./actions.module.css";
import { useHistory } from "react-router-dom";
import { Media, Segment } from "../../model/types";
import axios from "axios";
import { GoogleLogout } from "react-google-login";
import { Link } from "react-router-dom";

export default function Actions(props: {
    projectId: string;
    projectUser: string;
    mediaList: Media[];
    trackList: Segment[][];
}) {
    const history = useHistory();

    const saveProject = () => {
        const instance = axios.create({ baseURL: "http://localhost:8000" });
        let data = {
            projectId: props.projectId,
            projectUser: props.projectUser,
            mediaList: props.mediaList,
            trackList: props.trackList,
        };
        instance.put("/saveProject", data).then((res) => {
            if (res.status === 200) {
                console.log(res.data.success);
            } else {
                console.log(res.data.error);
            }
        });
    };

    return (
        <div className={styles.container}>
            <Link to="/projects">
            <button className={styles.button}>
                <img className={styles.logo} src="/logo192.png" />
            </button>
            </Link>
            <GoogleLogout
                clientId="956647101334-784vc8rakg2kbaeil4gug1ukefc9vehk.apps.googleusercontent.com"
                render={(renderProps) => (
                    <button
                        className={styles.button}
                        title="Logout"
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                    >
                        <span className="material-icons">logout</span>
                    </button>
                )}
                buttonText="Logout"
                onLogoutSuccess={() => history.push("/login")}
            ></GoogleLogout>
            <Link to="/export">
            <button className={styles.button} title="Export">
                <span className="material-icons">save_alt</span>
            </button>
            </Link>
            <button className={styles.button} title="Save" onClick={saveProject}>
                <span className="material-icons">save</span>
            </button>
            <button
                className={styles.button}
                onClick={() => history.push("/about")}
                title="About"
            >
                <span className="material-icons">help_outline</span>
            </button>
            <button className={styles.button}>
                <span className="material-icons">tonality</span>
            </button>
        </div>
    );
}
