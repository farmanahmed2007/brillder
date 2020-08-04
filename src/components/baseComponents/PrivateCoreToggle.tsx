import React from "react";
import sprite from "assets/img/icons-sprite.svg";

interface ToggleProps {
  isCore: boolean;
  onSwitch(): void;
}

const PrivateCoreToggle: React.FC<ToggleProps> = ({ isCore, onSwitch }) => {
  const renderCoreIcon = () => {
    let className = "svg active";
    if (isCore) {
      className += " selected";
    }
    return (
      <svg className={className}>
        {/*eslint-disable-next-line*/}
        <use href={sprite + "#box"} />
      </svg>
    );
  }

  const renderPrivateIcon = () => {
    let className = "svg active";
    if (!isCore) {
      className += " selected";
    }
    return (
      <svg className={className}>
        {/*eslint-disable-next-line*/}
        <use href={sprite + "#globe"} />
      </svg>
    );
  }

  return (
    <div className="core-public-toggle">
      <button className="btn btn btn-transparent ">
        <span className={isCore ? 'bold' : 'regular'}>Core</span>
        <div className="svgOnHover" onClick={onSwitch}>
          {renderCoreIcon()}
          {renderPrivateIcon()}
        </div>
        <span className={!isCore ? 'bold' : 'regular'}>Private</span>
      </button>
    </div>
  );
};

export default PrivateCoreToggle;