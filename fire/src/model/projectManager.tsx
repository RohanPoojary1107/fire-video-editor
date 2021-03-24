import MediaManager from "./mediaManager";
import { useEffect, useRef, useState } from "react";

export default function ProjectManager() {
  const [projectUser, setProjectUser] = useState<string>("");


  //   var recordedChunks;

  //   function Render() {
  //     var canvas: any = document.querySelector("canvas");

  //     // Optional frames per second argument.
  //     var stream = canvas.captureStream(25);
  //     recordedChunks = [];

  //     console.log(stream);
  //     var options = { mimeType: "video/webm; codecs=vp9" };
  //     let mediaRecorder = new MediaRecorder(stream, options);

  //     mediaRecorder.ondataavailable = handleDataAvailable;
  //     mediaRecorder.start();
  //   }

  //   function handleDataAvailable(event) {
  //     console.log("data-available");
  //     if (event.data.size > 0) {
  //       recordedChunks.push(event.data);
  //       console.log(recordedChunks);
  //     }
  //   }

  return <MediaManager 
  projectUser = {projectUser}
  setProjectUser = {setProjectUser}
  />;
}
