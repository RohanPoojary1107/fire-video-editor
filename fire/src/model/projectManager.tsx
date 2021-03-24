import MediaManager from "./mediaManager";
import { useState } from "react";

export default function ProjectManager() {
  const [projectUser, setProjectUser] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [projectWidth, setProjectWidth] = useState<number>(1920);
  const [projectHeight, setProjectHeight] = useState<number>(1080);
  const [projectFramerate, setProjectFramerate] = useState<number>(30);
  const [projectDuration, setProjectDuration] = useState<number>(0);

  return <MediaManager 
  projectUser={projectUser}
  setProjectUser={setProjectUser}
  projectHeight={projectHeight}
  setProjectHeight={setProjectHeight}
  projectWidth={projectWidth}
  setProjectWidth={setProjectWidth}
  projectFramerate={projectFramerate}
  setProjectFramerate={setProjectFramerate}
  projectName={projectName}
  setProjectName={setProjectName}
  projectId={projectId}
  setProjectId={setProjectId}
  projectDuration={projectDuration}
  setProjectDuration={setProjectDuration}
  />;
}
