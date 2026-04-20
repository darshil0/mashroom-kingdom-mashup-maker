/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  LevelData, TileType, EntityType, GameMode, CharacterType, 
  Player, Entity, Vector2D 
} from '../types';
import { TILE_SIZE, GRAVITY, FRICTION, CHARACTERS, COLORS } from '../constants';
import { checkTileCollision, isRectOverlap } from '../utils/physics';
import { Controls } from '../hooks/useControls';

interface GameCanvasProps {
  levelData: LevelData;
  character: CharacterType;
  controls: Controls;
  onStateChange: (state: any) => void;
  onWin: () => void;
  onGameOver: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelData,
  character,
  controls,
  onStateChange,
  onWin,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    type: 'PLAYER',
    character,
    pos: { x: 64, y: 300 },
    vel: { x: 0, y: 0 },
    width: 28,
    height: 30,
    isGrounded: false,
    isDead: false,
    direction: 1,
    isBig: false,
    score: 0,
    coins: 0,
    abilityCooldown: 0,
    invincibilityTime: 0,
  });

  const [entities, setEntities] = useState<Entity[]>([]);
  const [tiles, setTiles] = useState<TileType[][]>([]);
  const [camera, setCamera] = useState<number>(0);
  
  // Ref for mutable state to use in game loop
  const stateRef = useRef({
    player,
    entities: [] as Entity[],
    tiles: [] as TileType[][],
    levelData,
    isFinished: false,
  });

  useEffect(() => {
    stateRef.current.tiles = JSON.parse(JSON.stringify(levelData.tiles));
    stateRef.current.entities = levelData.entities.map((e, index) => ({
      id: `entity-${index}`,
      type: e.type,
      pos: { x: e.x * TILE_SIZE, y: e.y * TILE_SIZE },
      vel: { x: e.type === 'GOOMBA' ? -1.5 : 0, y: 0 },
      width: TILE_SIZE - 4,
      height: TILE_SIZE - 4,
      isGrounded: false,
      isDead: false,
      direction: -1,
    }));
    setTiles(stateRef.current.tiles);
    setEntities(stateRef.current.entities);
  }, [levelData]);

  const update = useCallback((ctrl: Controls) => {
    const { player, entities, tiles } = stateRef.current;
    if (player.isDead) return;

    // --- Player Physics ---
    const charStats = CHARACTERS[player.character];
    let newAx = 0;
    if (ctrl.left) {
      newAx = -1;
      player.direction = -1;
    } else if (ctrl.right) {
      newAx = 1;
      player.direction = 1;
    }

    player.vel.x += newAx * 0.5;
    player.vel.x *= FRICTION;
    if (Math.abs(player.vel.x) > charStats.speed) {
      player.vel.x = charStats.speed * Math.sign(player.vel.x);
    }

    if (ctrl.jump && player.isGrounded) {
      player.vel.y = -charStats.jumpForce;
      player.isGrounded = false;
    }

    player.vel.y += GRAVITY;
    
    // Move X
    player.pos.x += player.vel.x;
    let collision = checkTileCollision(player.pos, player.width, player.height, tiles);
    if (collision.collision) {
      if (collision.type && collision.type.startsWith('GOAL')) {
        if (!stateRef.current.isFinished) {
          stateRef.current.isFinished = true;
          onWin();
        }
      } else {
        if (player.vel.x > 0) player.pos.x = collision.x! * TILE_SIZE - player.width;
        else if (player.vel.x < 0) player.pos.x = (collision.x! + 1) * TILE_SIZE;
        player.vel.x = 0;
      }
    }

    // Move Y
    player.pos.y += player.vel.y;
    collision = checkTileCollision(player.pos, player.width, player.height, tiles);
    if (collision.collision) {
      if (collision.type && collision.type.startsWith('GOAL')) {
        if (!stateRef.current.isFinished) {
          stateRef.current.isFinished = true;
          onWin();
        }
      } else {
        if (player.vel.y > 0) {
          player.pos.y = collision.y! * TILE_SIZE - player.height;
          player.isGrounded = true;
          player.vel.y = 0;
        } else if (player.vel.y < 0) {
          player.pos.y = (collision.y! + 1) * TILE_SIZE;
          player.vel.y = 0;
          // Hit block from below
          handleBlockHit(collision.x!, collision.y!);
        }
      }
    } else {
      player.isGrounded = false;
    }

    // Ability
    if (ctrl.ability && player.abilityCooldown <= 0) {
      handleAbility(player, entities);
      player.abilityCooldown = charStats.abilityCooldown;
    }
    if (player.abilityCooldown > 0) player.abilityCooldown--;
    if (player.invincibilityTime > 0) player.invincibilityTime--;

    // Out of bounds
    if (player.pos.y > tiles.length * TILE_SIZE) {
      player.isDead = true;
      if (!stateRef.current.isFinished) {
        stateRef.current.isFinished = true;
        onGameOver();
      }
    }

    // --- Entities Physics ---
    for (const e of entities) {
      if (e.isDead) continue;
      
      if (e.type === 'GOOMBA') {
        const nextX = e.pos.x + e.vel.x;
        const checkX = e.vel.x > 0 ? nextX + e.width : nextX;
        const tileX = Math.floor(checkX / TILE_SIZE);
        const tileY = Math.floor((e.pos.y + e.height + 2) / TILE_SIZE);
        
        // Ledge detection
        let isLedge = false;
        if (tileY < tiles.length && tileX >= 0 && tileX < tiles[0].length) {
          if (tiles[tileY][tileX] === 'EMPTY') {
            isLedge = true;
          }
        }

        e.pos.x += e.vel.x;
        let c = checkTileCollision(e.pos, e.width, e.height, tiles);
        
        if (c.collision || isLedge) {
          e.vel.x *= -1;
          e.direction *= -1;
          e.pos.x += e.vel.x; // Move away from wall/ledge
        }
        e.vel.y += GRAVITY;
        e.pos.y += e.vel.y;
        c = checkTileCollision(e.pos, e.width, e.height, tiles);
        if (c.collision) {
          e.pos.y = c.y! * TILE_SIZE - e.height;
          e.vel.y = 0;
        }
      } else if (e.type === 'MUSHROOM') {
         e.pos.x += e.vel.x;
         let c = checkTileCollision(e.pos, e.width, e.height, tiles);
         if (c.collision) e.vel.x *= -1;
         e.vel.y += GRAVITY;
         e.pos.y += e.vel.y;
         c = checkTileCollision(e.pos, e.width, e.height, tiles);
         if (c.collision) {
           e.pos.y = c.y! * TILE_SIZE - e.height;
           e.vel.y = 0;
         }
      }

      // Player-Entity Collision
      if (isRectOverlap(
        { x: player.pos.x, y: player.pos.y, w: player.width, h: player.height },
        { x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }
      )) {
        handleEntityInteraction(e);
      }
    }

    // Camera
    const nearbyGoombas = entities.filter(e => 
      e.type === 'GOOMBA' && 
      !e.isDead && 
      Math.abs(e.pos.x - player.pos.x) < 400
    );

    let focusX = player.pos.x;
    if (nearbyGoombas.length > 0) {
      // Create a weighted focus between player and nearby threats
      const avgGoombaX = nearbyGoombas.reduce((acc, g) => acc + g.pos.x, 0) / nearbyGoombas.length;
      focusX = (player.pos.x * 0.7 + avgGoombaX * 0.3); // Heavily weight player, but lean toward threats
    }

    const targetCam = Math.max(0, focusX - 400); 
    setCamera((prev) => prev + (targetCam - prev) * 0.08); // Slightly slower smoothing for group follow
    
    setPlayer({ ...player });
    setEntities([...entities]);
    onStateChange({ player, coins: player.coins, score: player.score });
  }, [onGameOver, onWin, onStateChange]);

  const handleBlockHit = (x: number, y: number) => {
    const tile = stateRef.current.tiles[y][x];
    if (tile === 'BRICK' && stateRef.current.player.isBig) {
      stateRef.current.tiles[y][x] = 'EMPTY';
      setTiles([...stateRef.current.tiles]);
    } else if (tile === 'QUESTION') {
      stateRef.current.tiles[y][x] = 'EMPTY'; // Or a 'spent' block
      setTiles([...stateRef.current.tiles]);
      // Spawn Mushroom
      stateRef.current.entities.push({
        id: `mushroom-${Date.now()}`,
        type: 'MUSHROOM',
        pos: { x: x * TILE_SIZE, y: (y - 1) * TILE_SIZE },
        vel: { x: 2, y: 0 },
        width: TILE_SIZE - 4,
        height: TILE_SIZE - 4,
        isGrounded: false,
        isDead: false,
        direction: 1,
      });
    } else if (tile === 'GOAL_TOP' || tile === 'GOAL_BODY') {
       if (!stateRef.current.isFinished) {
         stateRef.current.isFinished = true;
         onWin();
       }
    }
  };

  const handleEntityInteraction = (entity: Entity) => {
    const { player } = stateRef.current;
    if (entity.isDead) return;

    if (entity.type === 'GOOMBA') {
      // Stomp
      if (player.vel.y > 0 && player.pos.y + player.height < entity.pos.y + 10) {
        entity.isDead = true;
        player.vel.y = -8;
        player.score += 100;
      } else if (player.invincibilityTime <= 0) {
        if (player.isBig) {
          player.isBig = false;
          player.height = 30;
          player.invincibilityTime = 60;
        } else {
          player.isDead = true;
          if (!stateRef.current.isFinished) {
            stateRef.current.isFinished = true;
            onGameOver();
          }
        }
      }
    } else if (entity.type === 'MUSHROOM') {
      entity.isDead = true;
      player.isBig = true;
      player.height = 58;
      player.score += 1000;
    } else if (entity.type === 'COIN') {
      entity.isDead = true;
      player.coins++;
      player.score += 200;
    }
  };

  const handleAbility = (player: Player, entities: Entity[]) => {
    switch (player.character) {
      case 'MARIO':
        // Spin kill nearby
        entities.forEach(e => {
          const dist = Math.hypot(e.pos.x - player.pos.x, e.pos.y - player.pos.y);
          if (dist < 100 && e.type === 'GOOMBA') e.isDead = true;
        });
        player.invincibilityTime = 30;
        break;
      case 'LUIGI':
      player.invincibilityTime = 60;
      // Dash with collision check
      const dashDistance = 120;
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const nextX = player.pos.x + (player.direction * (dashDistance / steps));
        const testPos = { ...player.pos, x: nextX };
        const col = checkTileCollision(testPos, player.width, player.height, stateRef.current.tiles);
        if (!col.collision) {
          player.pos.x = nextX;
        } else {
          break; // Stop at wall
        }
      }
      break;
    case 'TOAD':
      // Super Jump / Sprout boost
      player.vel.y = -18;
      player.isGrounded = false;
      player.invincibilityTime = 20;
      break;
    case 'PEACH':
      player.invincibilityTime = 180; // 3 seconds of shield
      break;
  }
};

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      update(controls);
      draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [controls, update]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = COLORS.SKY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera, 0);

    // Draw Tiles
    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 'EMPTY') return;
        ctx.fillStyle = COLORS[tile] || '#000';
        if (tile.startsWith('PIPE')) ctx.fillStyle = COLORS.PIPE;
        if (tile.startsWith('GOAL')) ctx.fillStyle = COLORS.GOAL;
        
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      });
    });

    // Draw Entities
    entities.forEach((e) => {
      if (e.isDead) return;
      ctx.fillStyle = COLORS[e.type] || '#fff';
      if (e.type === 'COIN') {
        ctx.beginPath();
        ctx.arc(e.pos.x + e.width/2, e.pos.y + e.height/2, e.width/2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(e.pos.x, e.pos.y, e.width, e.height);
      }
    });

    // Draw Player
    if (!stateRef.current.player.isDead) {
      const p = stateRef.current.player;
      if (p.invincibilityTime % 4 < 2) {
        ctx.save();
        ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
        
        const time = Date.now() / 1000;
        const isRunning = Math.abs(p.vel.x) > 0.5 && p.isGrounded;
        const isJumping = !p.isGrounded;
        const animSpeed = 15;
        const bob = Math.sin(time * 10) * 2;
        const walkCycle = Math.sin(time * animSpeed) * 8;
        
        // Spin effect for Mario
        if (p.character === 'MARIO' && p.invincibilityTime > 0 && p.abilityCooldown > CHARACTERS.MARIO.abilityCooldown - 20) {
          ctx.rotate(time * 50);
        }

        // Draw Limbs (Running/Idle/Jumping)
        ctx.fillStyle = CHARACTERS[p.character].color;
        
        if (isRunning) {
          // Legs
          ctx.fillRect(-p.width/2 + 2, p.height/2 - 6 + walkCycle/2, 6, 6);
          ctx.fillRect(p.width/2 - 8, p.height/2 - 6 - walkCycle/2, 6, 6);
          // Arms
          ctx.fillRect(-p.width/2 - 4 + walkCycle/2, -4, 6, 6);
          ctx.fillRect(p.width/2 - 2 - walkCycle/2, -4, 6, 6);
        } else if (isJumping) {
          // Legs up/out
          ctx.fillRect(-p.width/2 - 2, p.height/2 - 8, 6, 6);
          ctx.fillRect(p.width/2 - 4, p.height/2 - 8, 6, 6);
          // Arms up
          ctx.fillRect(-p.width/2 - 2, -p.height/2 - 2, 6, 6);
          ctx.fillRect(p.width/2 - 4, -p.height/2 - 2, 6, 6);
        } else {
          // Idle legs
          ctx.fillRect(-p.width/2 + 2, p.height/2 - 4, 6, 4);
          ctx.fillRect(p.width/2 - 8, p.height/2 - 4, 6, 4);
        }
        
        // Body (with bobbing if idle)
        const bodyHeight = p.height - (isRunning || isJumping ? 0 : 4);
        const yOffset = isRunning || isJumping ? 0 : bob;
        
        ctx.shadowBlur = p.invincibilityTime > 0 ? 15 : 0;
        ctx.shadowColor = CHARACTERS[p.character].color;
        
        ctx.fillRect(-p.width / 2, -p.height / 2 + yOffset, p.width, bodyHeight);
        ctx.shadowBlur = 0;

        // Ability visual for Peach (Shield)
        if (p.character === 'PEACH' && p.invincibilityTime > 0) {
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = time * 20;
          ctx.beginPath();
          ctx.arc(0, 0, p.width * 1.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Eyes
        ctx.fillStyle = '#000';
        const eyeX = p.direction > 0 ? 6 : -10;
        const eyeY = -8 + (isRunning || isJumping ? 0 : yOffset);
        
        if (isJumping) {
          // Excited eyes
          ctx.fillRect(eyeX, eyeY - 2, 4, 6);
        } else {
          ctx.fillRect(eyeX, eyeY, 4, 4);
        }

        // Luigi Ghost effect
        if (p.character === 'LUIGI' && p.invincibilityTime > 0) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#fff';
          ctx.fillRect(-p.width/2 - 4, -p.height/2 - 4, p.width + 8, p.height + 8);
          ctx.globalAlpha = 1.0;
        }

        ctx.restore();
      }
    }

    ctx.restore();
  };

  return (
    <div className="relative border-4 border-black bg-black overflow-hidden aspect-video w-full">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={480} 
        className="w-full h-full image-pixelated"
      />
    </div>
  );
};
