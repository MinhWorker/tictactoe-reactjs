import clsx from "clsx";
import styles from "./Window.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";

function Window({ title, children, isOpen, onClose }) {
    const windowRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (windowRef.current && !windowRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const onCloseWindow = () => {
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div ref={windowRef} className={clsx(styles.window)}>
                    <div className={clsx(styles["title-bar"])}>
                        <div className={clsx(styles.title)}>{title}</div>
                        <div className={clsx(styles.buttons)}>
                            <div
                                className={clsx(styles.button)}
                                onClick={onCloseWindow}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </div>
                        </div>
                    </div>
                    <div className={clsx(styles.content)}>
                        <span>{children}</span>
                    </div>
                </div>
            )}
        </>
    );
}

export default Window;
