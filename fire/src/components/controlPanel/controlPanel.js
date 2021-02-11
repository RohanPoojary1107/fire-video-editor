import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PlayIcon from "@material-ui/icons/PlayCircleFilledWhite";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";
import PauseIcon from "@material-ui/icons/Pause";
import local from "./controlPanel.module.css"

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    },
  },
}));

export default function IconButtons() {
  const classes = useStyles();
  const [play, changePlay] = useState(false);

  return (
    <div id="buttons">
      <IconButton aria-label="skipPrev">
        <SkipPrevious />
      </IconButton>
      {play && (
        <IconButton
          fontSize="large"
          aria-label="play"
          onClick={() => changePlay(!play)}
        >
          <PlayIcon />
        </IconButton>
      )}
      {!play && (
        <IconButton
          aria-label="pause"
          fontSize="large"
          onClick={() => changePlay(!play)}
        >
          <PauseIcon />
        </IconButton>
      )}
      <IconButton aria-label="skipNext">
        <SkipNext />
      </IconButton>
      <input type="range" min="1" max="100" className={local.slider}></input>
    </div>

  );
}
