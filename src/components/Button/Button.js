import clsx from "clsx";
import styles from "./Button.module.scss";

function Button({ primary, children, onClick, className, ...props }) {
    const _props = {
        onClick,

        ...props,
    };

    const buttonClass = {
        [styles.button]: true,
        [className]: !!className,
        [styles.primary]: primary,
    };

    return (
        <button className={clsx(buttonClass)} {..._props}>
            <span>{children}</span>
        </button>
    );
}

export default Button;
