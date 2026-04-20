/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface Controls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  ability: boolean;
}

export function useControls() {
  const [controls, setControls] = useState<Controls>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    ability: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          setControls((c) => ({ ...c, left: true }));
          break;
        case 'arrowright':
          setControls((c) => ({ ...c, right: true }));
          break;
        case 'arrowup':
        case 'w':
          setControls((c) => ({ ...c, up: true }));
          break;
        case 'arrowdown':
        case 's':
          setControls((c) => ({ ...c, down: true }));
          break;
        case ' ':
          setControls((c) => ({ ...c, jump: true }));
          break;
        case 'p':
        case 'x':
          setControls((c) => ({ ...c, ability: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          setControls((c) => ({ ...c, left: false }));
          break;
        case 'arrowright':
          setControls((c) => ({ ...c, right: false }));
          break;
        case 'arrowup':
        case 'w':
          setControls((c) => ({ ...c, up: false }));
          break;
        case 'arrowdown':
        case 's':
          setControls((c) => ({ ...c, down: false }));
          break;
        case ' ':
          setControls((c) => ({ ...c, jump: false }));
          break;
        case 'p':
        case 'x':
          setControls((c) => ({ ...c, ability: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return { controls, setControls };
}
