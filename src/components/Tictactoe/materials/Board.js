import React, { useEffect, useRef } from "react";
import Core from "./Core";

function Board({
    configs = {
        bot: false,
        cols: 3,
        rows: 3,
        bgColor: "#fff",
        lineColor: "#000",
        lineWidth: 2,
        hoverColor: "#f00",
        highlightColor: "#ff0",
        markColors: ["#f00", "#00f"],
        markThickness: "auto",
    },
    onWin,
    onDraw,
    onLose,
    ...props
}) {
    const canvasRef = useRef(null);

    // Initialize
    useEffect(() => {
        const core = new Core({ canvas: canvasRef.current, ...configs });
        core.listenForWinner((winner) => {
            if (winner === "Draw") {
                onDraw();
            } else if (winner === "Bot") {
                onLose();
            } else {
                onWin(winner);
            }
        });
        core.gameLoop();

        return () => {
            core.destroy();
        };
    });

    return <canvas {...props} ref={canvasRef} />;
}

export default Board;
