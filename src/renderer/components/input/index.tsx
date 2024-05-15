import React, { useEffect, useState } from 'react';
import { InputTypeEnum } from './models/input-type.enum';

interface InputProps {
  name?: string;
  value?: string | number;
  onChange?: (key: string, value: string | number) => void;
  placeholder: string;
  type: InputTypeEnum;
  children?: React.ReactNode;
}

function Input({ name, value, onChange, placeholder, type, children }: InputProps) {
  const [auxValue, setValue] = useState(value);
  const [currentType, setCurrentType] = useState(type);
  const [showPassword, setShowPassword] = useState(false);

  const clickInputType = () => {
    setShowPassword(!showPassword);
    setCurrentType(showPassword ? InputTypeEnum.PASSWORD : InputTypeEnum.TEXT);
  }

  const handleChange = (event: any) => {
    const { name, value } = event.target;

    setValue(value);
    onChange(name, value);
  };

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <div className="container">
      <label>{ placeholder }</label>

      <div className="container__input">
        <input name={ name }
               onChange={ handleChange }
               value={ auxValue }
               type={ currentType }
               placeholder={ placeholder } />
        { type === InputTypeEnum.PASSWORD? (
          <span onClick={ clickInputType }>{ showPassword ? '🙂' : '🫣' }</span>
        ) : null }
        { type !== InputTypeEnum.PASSWORD && children ? (
          <span>{ children }</span>
        ) : null }
      </div>
    </div>
  );
}

export default Input;
