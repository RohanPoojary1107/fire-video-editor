import styles from "./elements.module.css";
import model from "../../model/model";
import { useHistory } from "react-router-dom";
import { ChangeEvent } from "react";

export default function Actions() {
  const history = useHistory();

  const changeX = (event: ChangeEvent<HTMLInputElement>) => {
    model.project.segments[0].properties.x = +event.target.value;
  };

  const changeY = (event: ChangeEvent<HTMLInputElement>) => {
    model.project.segments[0].properties.y = +event.target.value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <label htmlFor="X" className={styles.pos}>
          Position:
        </label>
        <input
          name="X"
          id="XCoord"
          type="number"
          step="10"
          placeholder="0"
          onChange={changeX}
        />
        <input
          name="Y"
          id="YCoord"
          type="number"
          step="10"
          placeholder="0"
          onChange={changeY}
        />
      </div>
    </div>
  );
}
