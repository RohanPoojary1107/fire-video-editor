import { Link } from "react-router-dom";
import styles from "./projects.module.css";
import axios from "axios";
import { useState } from "react";
import { Project } from "../model/types";
import { useHistory } from "react-router-dom";

export default function Projects(props: { projectUser: string, projects: Project[], setProjects: (projects: Project[]) => void }) {
  const history = useHistory();

  function modifyProject(event: any) {
    event.preventDefault();
    if (!modifyingProject) return;

    const instance = axios.create({ baseURL: "http://localhost:8000" });

    if (modifyingProject._id != "") {
      instance.put("/editProject", modifyingProject, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }).then((res) => { setModifyingProject(null); });
      let newProjects = [];
      for (const proj of props.projects) {
        if (proj._id === modifyingProject._id) {
          newProjects.push(modifyingProject);
        } else {
          newProjects.push(proj);
        }
      }
      props.setProjects(newProjects);
    } else {
      instance.put("/addProject", modifyingProject, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }).then((res) => { setModifyingProject(null); });
      props.setProjects([...props.projects, modifyingProject]);
    }
  }

  function deleteProject(id: string) {
    const instance = axios.create({ baseURL: "http://localhost:8000" });
    instance
      .delete(`/deleteProject/${id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
      .then((res) => {
        props.setProjects(props.projects.filter(item => item._id !== id));
      });
  }

  const [modifyingProject, setModifyingProject] = useState<Project | null>(null);

  const NewProject = () => {
    if (!modifyingProject) return;

    return (<div id="project">
      <form onSubmit={modifyProject}>
        <label>{modifyingProject._id === "" ? "Create" : "Modify"} Project </label>
        <button onClick={() => { setModifyingProject(null) }}>
          <span className="material-icons">close</span>
        </button>
        <br />
        <label>Name: </label>
        <input type="text" id="title" name="title" required value={modifyingProject.name}
          onChange={(event) => { setModifyingProject({ ...modifyingProject, name: event.target.value }) }}></input>
        <br />
        <label>Framerate: </label>
        <input type="number" id="frame" name="frame" min="1" required value={modifyingProject.framerate}
          onChange={(event) => { setModifyingProject({ ...modifyingProject, framerate: +event.target.value }) }}></input>
        <br />
        <label>Width: </label>
        <input type="number" id="width" name="width" min="1" required value={modifyingProject.width}
          onChange={(event) => { setModifyingProject({ ...modifyingProject, width: +event.target.value }) }}></input>
        <br />
        <label>Height: </label>
        <input type="number" id="height" name="height" min="1" required value={modifyingProject.height}
          onChange={(event) => { setModifyingProject({ ...modifyingProject, height: +event.target.value }) }}></input>
        <br />
        <button type="submit">
          <span className="material-icons">send</span>
        </button>
      </form>
    </div>
    )
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.vbar}>
          <Link to="/">
            <img className={styles.logo} src="/logo192.png" />
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
        {props.projects.map((project, index) => {
          return <div
            className={styles.projectBox}
            style={{
              backgroundImage: `url()`,
            }}
            onClick={() => { history.push("/editor"); }}
          >
            <h2>{project.name}</h2>
            <button onClick={(evt) => { evt.stopPropagation(); setModifyingProject({ ...project }) }}>
              <span className="material-icons">mode</span>
            </button>
            <button onClick={(evt) => { evt.stopPropagation(); deleteProject(project._id) }}>
              <span className="material-icons">delete</span>
            </button>
          </div>
        })}
        {modifyingProject != null ? NewProject() : null}
      </div>
      <button className={styles.new} onClick={() => setModifyingProject({
        _id: "",
        name: "",
        width: 1920,
        height: 1080,
        framerate: 30,
        duration: 0
      })}>
        <span className="material-icons">add</span>
      </button>
    </div>
  );
}
