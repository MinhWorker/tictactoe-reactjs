import clsx from "clsx";
import styles from "./Toggle.module.scss";

function Toggle({ className, size, children, onChecked, onUnChecked, ...props }) {
    let _props = {

        ...props,
    }

    let customSize = size || 100;

    let toggleSize = {
        "--toggle-size": `${customSize}px`,
    }


    const hanleChecked = (e) => {
        let checked = e.target.checked;
        if (checked) {
            onChecked();
        } else {
            onUnChecked();
        }
    }

    return (
        <div className={clsx(styles.wrapper)} style={toggleSize}>
            <span>{children}</span>
            <input type="checkbox" id="toggle_checkbox_react_component_12a6D" {..._props} onClick={hanleChecked} />
            <label htmlFor="toggle_checkbox_react_component_12a6D" className={clsx(styles.button)}></label>
        </div>
    );
}

export default Toggle;
