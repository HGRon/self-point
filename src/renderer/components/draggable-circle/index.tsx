import { useEffect, useRef, useState } from 'react';
import { MouseFunction } from './models/mouse-function.type';
import { MouseInfoInterface } from './models/mouse-info.interface';

interface DraggableCircleProps {
  onComplete?: () => void;
}

function DraggableCircle({ onComplete }: DraggableCircleProps) {
  const [mouseInfo, setMouseInfo] = useState<MouseInfoInterface>({ x: 0, y: 0, isMouseDown: false });

  const draggableRef = useRef(null);
  const draggableCircleRef = useRef(null);

  const onMouseDown: MouseFunction = (e) => {
    draggableCircleRef.current.style.transitionDuration = '0s';
    draggableRef.current.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing';

    setMouseInfo({ x: e.screenX, y: e.screenY, isMouseDown: true });
  };

  const onMouseUp: MouseFunction = () => {
    draggableCircleRef.current.style.transitionDuration = '1s';

    draggableRef.current.style.cursor = 'grab';
    document.body.style.cursor = 'auto';

    draggableCircleRef.current.style.width = '0';
    draggableCircleRef.current.style.height = '0';

    setMouseInfo({ x: 0, y: 0, isMouseDown: false });
  };

  const onMouseMove: MouseFunction = (e) => {
    if (!mouseInfo.isMouseDown) return;

    const diffInX = Math.abs(e.screenX - mouseInfo.x);
    const diffInY = Math.abs(e.screenY - mouseInfo.y);
    const size = Math.min(Math.max(diffInX, diffInY) * 2, 300);

    draggableCircleRef.current.style.width = `${ size }px`;
    draggableCircleRef.current.style.height = `${ size }px`;

    if (size === 300) {
      mouseInfo.isMouseDown = false;
      draggableRef.current.style.cursor = 'grab';
      document.body.style.cursor = 'auto';

      if (onComplete)
        onComplete();
    }
  };

  useEvent('mousemove', onMouseMove);
  useEvent('mouseup', onMouseUp);

  return (
    <div className="draggable"
         ref={ draggableRef }
         onMouseDown={ onMouseDown }
    >
      <div ref={ draggableCircleRef } className="draggable__circle"></div>
      <span>Arraste para confirmar 🧾</span>
    </div>
  );
}

export default DraggableCircle;

const useEvent = (eventType: string, callback: (event: any) => void) => {
  useEffect(() => {
    const eventHandler = (event: any) => {
      callback(event);
    };

    window.addEventListener(eventType, eventHandler);

    return () => {
      window.removeEventListener(eventType, eventHandler);
    };
  }, [eventType, callback]);
};


