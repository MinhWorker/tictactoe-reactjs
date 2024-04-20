import clsx from "clsx";
import styles from "./RadialMenu.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrosoft } from "@fortawesome/free-brands-svg-icons/faMicrosoft";

function RadialMenu({
    options = [],
    value,
    id,
    className,
    onSelect,
    ...passProps
}) {
    let props = {
        options,
        value,
        onSelect,
    };

    let buttonProps = {
        id,
        className,
        ...passProps,
    };

    const handleClick = () => {
        let menu = document.querySelector(`.${clsx(styles.menu)}`);
        let toggle = document.querySelector(`.${clsx(styles.toggle)}`);
        menu.classList.toggle(styles.active);
        toggle.classList.toggle(styles.active);
    };

    const handleItemClick = (index) => {
        let lastChosen = document.querySelector(`.${clsx(styles.chosen)}`);
        if (lastChosen) {
            lastChosen.classList.toggle(styles.chosen);
        }
        props.value = props.options[index];
        props.onSelect(props.value);
        let chosenItem = document.getElementById(`item-${index}`);
        chosenItem.classList.toggle(styles.chosen);
        handleClick();
    };

    return (
        <div className={clsx(styles.wrapper)}>
            <ul
                style={{ "--total": options.length }}
                className={clsx(styles.menu)}
            >
                {options.map((option, i) => {
                    return (
                        <li
                            key={i}
                            id={`item-${i}`}
                            className={
                                options[i] === props.value
                                    ? clsx(styles.chosen)
                                    : ""
                            }
                            style={{ "--i": i }}
                            onClick={() => handleItemClick(i)}
                        >
                            <div>{option}</div>
                        </li>
                    );
                })}
                <button
                    {...buttonProps}
                    className={clsx(styles.toggle)}
                    onClick={() => handleClick()}
                >
                    <FontAwesomeIcon
                        className={clsx(styles.icon)}
                        icon={faMicrosoft}
                    />
                </button>
            </ul>
        </div>
    );
}

export default RadialMenu;
