import { memo } from "react";
import clsx from "clsx";
import styles from "./Tictactoe.module.scss";
import Board from "./materials/Board";

const Tictactoe = memo(
    ({
        bot,
        cols,
        rows,
        bgColor,
        lineColor,
        lineWidth,
        hoverColor,
        highlightColor,
        markColors,
        markThickness,
        onWin,
        onDraw,
        onLose,
    }) => {
        const configs = {
            bot,
            cols,
            rows,
            bgColor,
            lineColor,
            lineWidth,
            hoverColor,
            highlightColor,
            markColors,
            markThickness,
        };

        return (
            <div style={{ margin: "40px", padding: "40px" }} className={clsx(styles.wrapper)}>
                <Board
                    configs={configs}
                    onWin={onWin}
                    onDraw={onDraw}
                    onLose={onLose}
                />
            </div>
        );
    }
);
export default Tictactoe;
