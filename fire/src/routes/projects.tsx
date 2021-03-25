import { Link } from "react-router-dom";
import styles from "./projects.module.css";
import axios from "axios";
import { useState } from "react";

export default function Projects(props: { projectUser: string }) {
  function addProject(event: any) {
    event.preventDefault();
    const instance = axios.create({ baseURL: "http://localhost:8000" });
    let data = {
      projectUser: props.projectUser,
      title: event.target.elements.title.value,
      frameRate: +event.target.elements.frame.value,
      width: +event.target.elements.width.value,
      height: +event.target.elements.height.value,
    };
    instance.put("/addProject", data).then((res) => {});
  }

  function editProject(event: any) {
    event.preventDefault();
    const instance = axios.create({ baseURL: "http://localhost:8000" });
    let data = {
      _id: "605ce8083e52616facf3efcc", // Need to give specific id Here
      projectUser: props.projectUser,
      title: event.target.elements.title.value,
      frameRate: +event.target.elements.frame.value,
      width: +event.target.elements.width.value,
      height: +event.target.elements.height.value,
    };
    instance.put("/editProject", data).then((res) => {});
  }
  function deleteProject() {
    const instance = axios.create({ baseURL: "http://localhost:8000" });
    instance
      .delete("/deleteProject/605bd96d7a856959000f5040")
      .then((res) => {});
  }

  const [createForm, setCreateForm] = useState<boolean>(false);
  const [createFormEdit, setCreateFormEdit] = useState<boolean>(false);

  const addClick = () => setCreateForm(true);
  const closeAdd = () => setCreateForm(false);
  const addClickEdit = () => setCreateFormEdit(true);
  const closeEdit = () => setCreateFormEdit(false);
  const NewProject = () => (
    <div id="project">
      <form onSubmit={addProject}>
        <label>Create a New Project </label>
        <button onClick={closeAdd}>
          <span className="material-icons">close</span>
        </button>
        <br />
        <label>Title: </label>
        <input type="text" id="title" name="title" required></input>
        <br />
        <label>Frame Rate: </label>
        <input type="number" id="frame" name="frame" min="1" required></input>
        <br />
        <label>Width: </label>
        <input type="number" id="width" name="width" min="1" required></input>
        <br />
        <label>Height: </label>
        <input type="number" id="height" name="height" min="1" required></input>
        <br />
        <button type="submit">
          <span className="material-icons">send</span>
        </button>
      </form>
    </div>
  );

  const EditProject = () => (
    <div id="project">
      <form onSubmit={editProject}>
        <label>Edit Project </label>
        <button onClick={closeEdit}>
          <span className="material-icons">close</span>
        </button>
        <br />
        <label>Title: </label>
        <input type="text" id="title" name="title" required></input>
        <br />
        <label>Frame Rate: </label>
        <input type="number" id="frame" name="frame" min="1" required></input>
        <br />
        <label>Width: </label>
        <input type="number" id="width" name="width" min="1" required></input>
        <br />
        <label>Height: </label>
        <input type="number" id="height" name="height" min="1" required></input>
        <br />
        <button type="submit">
          <span className="material-icons">send</span>
        </button>
      </form>
    </div>
  );
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
        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
          <button onClick={addClickEdit}>
            <span className="material-icons">mode</span>
          </button>
          <button onClick={deleteProject}>
            <span className="material-icons">delete</span>
          </button>
        </div>

        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
        </div>

        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
        </div>

        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
        </div>

        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
        </div>

        <div
          className={styles.projectBox}
          style={{
            backgroundImage: `url()`,
          }}
        >
          <h2>Project Name</h2>
        </div>
        {createForm ? <NewProject /> : null}
        {createFormEdit ? <EditProject /> : null}
      </div>

      <button className={styles.new} onClick={addClick}>
        <span className="material-icons">add</span>
      </button>
    </div>
  );
}
