import { ButtonTypeEnum } from './models/button-type.enum';
import { ButtonAnimationEnum } from './models/button-animation.enum';
import React from 'react';
import { ButtonSizeEnum } from './models/button-size.enum';

interface ButtonProps {
  hidden?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  type?: ButtonTypeEnum;
  animation?: ButtonAnimationEnum;
  size?: ButtonSizeEnum;
}

function Button({ onClick, children, type, animation, size }: ButtonProps) {
  const styleType =  buttonStyleByType[type || ButtonTypeEnum.VOID];
  const styleAnimation = buttonStyleByAnimation[animation || ButtonAnimationEnum.HOVER_OPACITY];
  const styleSize = buttonStyleBySize[size || ButtonSizeEnum.MEDIUM];

  return (
    <button onClick={ onClick } className={ `button ${ styleType } ${ styleAnimation } ${ styleSize }` }>
      { children }
    </button>
  );
}

export default Button;

const buttonStyleByType: Record<ButtonTypeEnum, string> = {
  [ButtonTypeEnum.VOID]: 'button--void',
  [ButtonTypeEnum.RESET]: 'button--reset',
  [ButtonTypeEnum.ERROR]: 'button--error',
  [ButtonTypeEnum.SUBMIT]: 'button--submit',
  [ButtonTypeEnum.CONFIRM]: 'button--confirm',
}

const buttonStyleByAnimation: Record<ButtonAnimationEnum, string> = {
  [ButtonAnimationEnum.NONE]: '',
  [ButtonAnimationEnum.HOVER_ROTATE]: 'hover-rotate',
  [ButtonAnimationEnum.HOVER_SCALE]: 'hover-scale',
  [ButtonAnimationEnum.HOVER_OPACITY]: 'hover-opacity',
}

const buttonStyleBySize: Record<ButtonSizeEnum, string> = {
  [ButtonSizeEnum.SMALL]: 'button--small',
  [ButtonSizeEnum.MEDIUM]: 'button--medium',
  [ButtonSizeEnum.LARGE]: 'button--large',
}
