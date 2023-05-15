/* eslint-disable jsx-a11y/alt-text */

import { Layer, Rect, Circle, Ellipse, Line, Stage, Image, Text, Group } from "react-konva";
import { Inter } from 'next/font/google'
import { FC, useCallback, useEffect, useRef, useState } from "react";
import useImage from 'use-image';
import { atom, useSetRecoilState, useRecoilValue } from 'recoil';

const SHOW_BOUNDING_BOX = false

const keyboardState = atom({
  key: 'keyboardState',
  default: {},
});

function KeyboardEventHandler() {
  const setKeyboardState = useSetRecoilState(keyboardState);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      setKeyboardState((prev) => ({
        ...prev,
        [event.code]: true,
      }));
    };

    const handleKeyUp = (event: any) => {
      setKeyboardState((prev) => ({
        ...prev,
        [event.code]: false,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
}

const inter = Inter({ subsets: ['latin'] })

// viewer ?

type Vec2 = {
  x: number
  y: number
}

type Player = {
  t: number
  pos: Vec2
  disp_d: Vec2
  v: Vec2
  jumping: boolean
  fated: boolean
}

const PLAYER_R = 50

const PlayerView: FC<Player> = (player) => {
  const [image] = useImage('kodai_dodo.png')
  const [image_fated] = useImage('kodai_dodo_fated.png')
  const image_now = (player.fated ? image_fated : image)
  return <Group>
    <Image image={image_now} x={ player.pos.x + player.disp_d.x - 75 } y={ player.pos.y + player.disp_d.y - 73 } width={150} height={146}/>
    {/* SHOW_BOUNDING_BOX && <Rect stroke='red' strokeWidth={2} x={player.pos.x - 75} y={player.pos.y - 73} width={150} height={146} /> */}
    {SHOW_BOUNDING_BOX && <Circle stroke='red' strokeWidth={2} x={player.pos.x} y={player.pos.y} radius={PLAYER_R} />}
  </Group>
};

type Charactor = "TIGER" | "VELOCI" | "MICRO"

const imageName = {
  "TIGER": "animal_fukuroookami_tasmanian_tiger.png",
  "VELOCI": "Velociraptor.png",
  "MICRO": "kodai_microraptor.png",
}

type Enemy = {
  pos: Vec2
  charactor: Charactor
}

const nextEnemy = () => {
  const enemies: Enemy[] = [
    {
      pos: { x: 700, y: 450 + 90 },
      charactor: "TIGER",
    },
    {
      pos: { x: -100, y: 450 + 70 },
      charactor: "VELOCI",
    },
    {
      pos: { x: 700, y: 300 },
      charactor: "MICRO",
    },
  ]
  return enemies[Math.floor(Math.random() * 3)]
}

const stepEnemy = (enemy: Enemy, dt: number) => {
  const newEnemy = enemy
  if (enemy.charactor == "TIGER") {
    newEnemy.pos.x += dt * (-300)
  } else if (enemy.charactor == "VELOCI") {
    newEnemy.pos.x += dt * (300)
  } else if (enemy.charactor == "MICRO") {
    newEnemy.pos.x += dt * (-400)
  }
  return newEnemy
}

const ENEMY_R = 50

const EnemyView: FC<Enemy> = (enemy) => {
  const [image] = useImage(imageName[enemy.charactor])
  const scaleX = enemy.charactor == "VELOCI" ? -1 : 1
  return <Group>
    <Image image={image} x={ enemy.pos.x - 84 * scaleX } y={ enemy.pos.y - 69 } width={168} height={138} scaleX={scaleX} />
    {/* SHOW_BOUNDING_BOX && <Rect stroke='blue' strokeWidth={2} x={enemy.pos.x - 84} y={enemy.pos.y - 69} width={168} height={138} /> */}
    {SHOW_BOUNDING_BOX && <Circle stroke='blue' strokeWidth={2} x={enemy.pos.x} y={enemy.pos.y} radius={ENEMY_R} />}
  </Group>
};

type Spawner = {
  prevT: number
}

type Game = {
  t: number
  spawner: Spawner
  player: Player
  enemies: Enemy[]
  gameOver: boolean
}

const RetryButton: FC<any> = (props) => {
  return <Group>
    <Rect fill='gray' width={200} height={100} {...props} x={props.x - 100} y={props.y - 50} onClick={props.callback} />
    <Text text={"RETRY"} {...props} />
  </Group>
}

const GameView: FC<Game & {handleRetry: any}> = ({ t, player, enemies, gameOver, handleRetry }) => {
  return <Layer>
      <Rect fill='red' x={100} y={100} width={300} height={200} />
      <Rect fill='red' x={400} y={350} width={50} height={50} />
      <Rect fill='blue' x={50} y={350} width={50} height={50} />
      <Circle fill='blue' x={20} y={100} radius={50} opacity={0.5} />
      <Ellipse fill='green' x={250} y={300} radiusX={100} radiusY={180} />
      <Line points={[400, 50, 300, 150, 150, 170, 300, 50]} stroke='purple' strokeWidth={15} />
      {enemies.map((enemy: Enemy) => {
        // eslint-disable-next-line react/jsx-key
        return <EnemyView {...enemy}/>
      })}
      <PlayerView {...player} />
      <Text x={10} y={10} text={String(Math.floor(t))} />
      { gameOver && <RetryButton x={300} y={300} callback={handleRetry} /> }
    </Layer>
}

type GameStage = {
  handleClick: any
  handleRetry: any
  width: number
  height: number
  windowSize: any
  game: Game
}

const GameStageView: FC<GameStage> = ({ handleClick, handleRetry, windowSize, width, height, game }) => {
  const scale = Math.min((windowSize.width) / width, (windowSize.height) / height);
  return <Stage width={width * scale} height={height * scale} scaleX={scale} scaleY={scale} className="flex justify-center" onKeyPress={(e: any) => console.log(e)} onClick={() => handleClick()} onTouchStart={() => handleClick()}>
    <GameView {...game} handleRetry={handleRetry} />
    <Layer>
      <Rect stroke='black' strokeWidth={4} x={2} y={2} width={width-4} height={height-4} />
    </Layer>
  </Stage>
}

// ループで実行したい処理 を callback関数に渡す
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = useRef(0);
  // useCallback で callback 関数が更新された時のみ関数を再生成
  const loop = useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
    // loop を依存配列に
  }, [loop]);
};

const GND = 623

export default function Home() {

  const [game, setGame] = useState({
    t: 0,
    spawner: { prevT: 0 },
    player: {
      t: 0,
      pos: {x: 275, y: GND},
      disp_d: {x: 0, y: 0},
      v: {x: 0, y: 0},
      jumping: true,
      fated: false,
    },
    enemies: Array<Enemy>(),
    gameOver: false,
  })

  const currentKeyboardState: any = useRecoilValue(keyboardState);

  useAnimationFrame(() => {
    const dt = 1 / 60.0;

    const player = game.player

    const newT = game.t + dt
    const newSpawner = game.spawner

    const newPlayer = player
    newPlayer.t += dt

    if (!newPlayer.fated) {

      if (newPlayer.jumping) {
        newPlayer.pos.y = player.pos.y + player.v.y * dt
        if (newPlayer.pos.y + 100 < GND) {
          newPlayer.v.y += 1500 * dt
        } else {
          newPlayer.jumping = false;
          newPlayer.pos.y = GND - 100
          newPlayer.v.y = 0
        }

        newPlayer.disp_d = {x:0, y:0}
      } else {
        newPlayer.disp_d = {x:0, y: Math.abs(Math.sin(newPlayer.t * 10)) * -10}
      }

    }

    const newEnemies = game.enemies.map((enemy: Enemy) => {
      return stepEnemy(enemy, dt)
    }).filter((enemy: Enemy) => {
      return enemy.pos.x >= -200 && enemy.pos.x <= 800
    })

    // spawn
    if (game.t > newSpawner.prevT + 2.0) {
      newEnemies.push(nextEnemy())
      newSpawner.prevT += 2.0
    }

    const hit = game.enemies.some((enemy: Enemy) => {
      return Math.pow(enemy.pos.x - player.pos.x, 2) + Math.pow(enemy.pos.y - player.pos.y, 2) < Math.pow(ENEMY_R + PLAYER_R, 2)
    })
    if (hit) {
      newPlayer.fated = true
    }

    setGame({
      t: newT,
      spawner: newSpawner,
      player: newPlayer,
      enemies: newEnemies,
      gameOver: game.gameOver || hit,
    })

    // かなり良くない書き方だけど。。
    if ("Space" in currentKeyboardState && currentKeyboardState["Space"]) {
      handleClick()
    }
  });

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  })

  const jump = () => {
    console.log("jump")
    if (!game.player.jumping) {
      //const newPlayer = player
      game.player.jumping = true
      game.player.v.y = -1000
      setGame(game)
    }
  }

  const handleClick = () => {
    jump()
  }

  const handleRetry = () => {
    console.log("handle retry")
  }

  const W = 600;
  const H = 600;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="z-10 w-full h-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <GameStageView handleClick={() => handleClick()} handleRetry={handleRetry} windowSize={windowSize} width={W} height={H} game={game} />
      </div>
      <KeyboardEventHandler />
    </main>
  )
}
