import React, { useState } from 'react';

interface ToggleProps {
  onChange: (activated: boolean) => void;
  leftIcon: string;
  rightIcon: string;
  startValue: boolean
}

function Toggle({ onChange, leftIcon, rightIcon, startValue }: ToggleProps) {
  const [toggled, setToggled] = useState(startValue);

  const handleChange = () => {
    setToggled(!toggled);
    onChange(toggled);
  };

  return (
    <div onClick={ handleChange } className="toggle">
      <div className={ 'toggle__pointer--' + (toggled ? 'left' : 'right') }>
        <span>{ toggled ? leftIcon : rightIcon }</span>
      </div>
    </div>
  );
}

export default Toggle;
