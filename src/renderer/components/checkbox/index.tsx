import React, { useEffect, useState } from 'react';

interface CheckboxProps {
  name?: string;
  value?: boolean;
  onChange?: (key: string, value: boolean) => void;
  placeholder: string;
}

function Checkbox({ name, value, onChange, placeholder }: CheckboxProps) {
  const [auxValue, setValue] = useState(value);

  const handleChange = (event: any) => {
    const { name, checked } = event.target;

    setValue(checked);
    onChange(name, checked);
  };

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <div className="checkbox">
      <label>{ placeholder }</label>
      <input onChange={ handleChange } name={ name } type="checkbox" checked={ auxValue } />
    </div>
  );
}

export default Checkbox;
