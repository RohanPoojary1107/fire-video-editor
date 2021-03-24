import { Link } from "react-router-dom";
import styles from "./login.module.css";
import GoogleLogin from 'react-google-login';
import axios from "axios";
import { useHistory } from "react-router-dom";


export default function Login(props:
    {
        projectUser: string;
        setProjectUser: (user: string) => void;
    }) {
        
        const history = useHistory();
        const unsuccessfulLogin = (response: any) => {
            console.log("Login process terminated");
        }
    
    const handleLogin = (response: any) => {
        console.log(response);
        const instance = axios.create({ baseURL: "http://localhost:8000" });
        let data = {
            token: response.tokenId
        };
        instance.post("/auth/login", data).then((res) => {
            props.setProjectUser(res.data.email);
            history.push("/projects");
        
        });
      }
    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.login}>
                <div className={styles.loginBox}> 
                <Link to="/"><img className={styles.logo} src="/logo192.png"/></Link>
                {/* <button className={styles.button} title="Sign in with Google">
                    <img className={styles.google} src="/google.svg"/> Sign in with Google
                </button> */}
                <GoogleLogin
                    clientId="956647101334-784vc8rakg2kbaeil4gug1ukefc9vehk.apps.googleusercontent.com"
                    render={renderProps => (
                        <button className={styles.button} onClick={renderProps.onClick} disabled={renderProps.disabled} title="Sign in with Google">
                        <img className={styles.google} src="/google.svg"/> Sign in with Google
                    </button>
                    )}
                    buttonText="Login"
                    onSuccess={handleLogin}
                    onFailure={unsuccessfulLogin}
                    cookiePolicy={'single_host_origin'}
  />
                </div>
            </div>
        </div>);
}
