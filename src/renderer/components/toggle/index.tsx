import React, { useEffect, useState } from 'react';

interface ToggleProps {
  onChange: (activated: boolean) => void;
  trueIcon: string;
  falseIcon: string;
  startValue?: boolean;
  disabled?: boolean;
}

function Toggle({ onChange, trueIcon, falseIcon, startValue, disabled }: ToggleProps) {
  const [toggled, setToggled] = useState(startValue || false);

  const handleChange = () => {
    if (disabled)
      return;

    const t = !toggled;

    setToggled(t);
    onChange(t);
  };

  useEffect(() => {
    setToggled(startValue);
  }, [startValue]);

  return (
    <div onClick={ handleChange } className={ 'toggle' + (disabled ? ' disabled' : '') }>
      <div className={ 'toggle__pointer--' + (toggled ? 'left' : 'right') }>
        <span>{ toggled ? trueIcon : falseIcon }</span>
      </div>
    </div>
  );
}

export default Toggle;
