import { Link } from "react-router-dom";
import styles from "./login.module.css";

export default function Login() {
    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.login}>
                <div className={styles.loginBox}> 
                <Link to="/"><img className={styles.logo} src="/logo192.png"/></Link>
                <button className={styles.button} title="Sign in with Google">
                    <img className={styles.google} src="/google.svg"/> Sign in with Google
                </button>
                </div>
            </div>
        </div>);
}
