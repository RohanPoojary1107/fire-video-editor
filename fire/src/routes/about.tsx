import { Link } from "react-router-dom";
import styles from "./about.module.css";

export default function About() {
    return (
        <div className={styles.container}>
            <Link to="/"><span className="material-icons">arrow_back</span></Link>
            <h1>About Us</h1>
            <p>We are a group of developers passionate to bring the best products to consumers.</p>
            <p>We are constantly testing our products for bugs and issues</p>
            <p>If you come accross any such bug or just want to give feedback to our team don't hesisate to contact us</p>
            <br></br>
            <address>
                <p>Email Address: <a href="mailto:react.editor@gmail.com">react.editor@gmail.com</a></p>
            </address>

            <p>Version 0.1</p>
        </div>);
}

