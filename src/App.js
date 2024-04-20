import clsx from "clsx";
import styles from "./App.module.scss";
import { RadialMenu, Tictactoe, Button, Toggle, Window } from "./components";
import { useState, useMemo } from "react";

function App() {
    const boardSizeOptions = [
        <option value={3}>3</option>,
        <option value={6}>6</option>,
        <option value={10}>10</option>,
        <option value={15}>15</option>,
        <option value={20}>20</option>,
        <option value={25}>25</option>,
    ];

    const [boardSize, setBoardSize] = useState(3);
    const [newGame, setNewGame] = useState(Math.floor(Math.random() * 8888888));
    const [bot, setBot] = useState(false);
    const [window, setWindow] = useState({isOpen: false, message: ""});

    const boardConfigs = useMemo(() => ({
        gameID: newGame,
        bot: bot,
        cols: boardSize,
        rows: boardSize,
        bgColor: "transparent",
        lineColor: "#b6d6f2",
        lineWidth: 1,
        hoverColor: "#6d81f350",
        highlightColor: "#1dbf0480",
        markColors: ["#6d81f3", "#f36d81"],
        markThickness: "auto",
    }), [bot, boardSize, newGame]);

    const handleBoardSizeSelect = (option) => {
        setBoardSize(option.props.value);
    };

    const handleClickNewGame = () => {
        setNewGame(Math.floor(Math.random() * 8888888));
    };

    const handleBotChecked = () => {
        setBot(true);
    };

    const handleBotUnChecked = () => {
        setBot(false);
    };

    const handleWin = useMemo(() => {
        return (winner) => {
            let notification = winner + " won!";
            setWindow({isOpen: true, message: notification});
        };
    }, []);

    const handleDraw = useMemo(() => {
        return () => {
            let notification = "Draw!";
            setWindow({isOpen: true, message: notification});
        };
    }, []);

    const handleLose = useMemo(() => {
        return () => {
            let notification = "You lost!";
            setWindow({isOpen: true, message: notification});
        };
    }, []);

    return (
        <div className={clsx(styles.app)}>
            <h1 className={clsx(styles.title)}>
                EXPLO<span className={clsx(styles.span)}>RE</span> TICT
                <span className={clsx(styles.span)}>ACT</span>OE{" "}
                <span className={clsx(styles.span)}>J</span>OY
                <span className={clsx(styles.span)}>S</span>
            </h1>
            <div className={clsx(styles.container)}>
                <div className={clsx(styles["control-container"])}>
                    <RadialMenu
                        options={boardSizeOptions}
                        value={boardSizeOptions[0]}
                        onSelect={handleBoardSizeSelect}
                    />
                    <div className={clsx(styles["button-container"])}>
                        <Toggle size={80} onChecked={handleBotChecked} onUnChecked={handleBotUnChecked} >BOT</Toggle>
                    </div>
                    <div className={clsx(styles["button-container"])}>
                        <Button primary onClick={handleClickNewGame}>NEW GAME</Button>
                    </div>
                </div>
                <div className={clsx(styles["game-container"])}>
                    <Tictactoe {...boardConfigs} boardSize={boardSize} onWin={handleWin} onDraw={handleDraw} onLose={handleLose} />
                </div>
            </div>
            <Window title={"Notification"} isOpen={window.isOpen} onClose={() => { setWindow(false)}}>{window.message}</Window>
        </div>
    );
}

export default App;
