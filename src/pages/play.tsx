import { Layer, Rect, Circle, Ellipse, Line, Stage, Image, Text } from "react-konva";
import { Inter } from 'next/font/google'
import { FC, useCallback, useEffect, useRef, useState } from "react";
import useImage from 'use-image';

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
}

const PlayerView: FC<Player> = ({ t, pos, disp_d, v, jumping }) => {
  const [image] = useImage('kodai_dodo.png')
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image image={image} x={
    pos.x + disp_d.x
  } y={
    pos.y + disp_d.y
  } width={150} height={147}/>
};

type Enemy = {
  pos: Vec2
}

const EnemyView: FC<Enemy> = ({ pos }) => {
  const [image] = useImage('animal_fukuroookami_tasmanian_tiger.png')
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image image={image} x={ pos.x } y={ pos.y } width={169} height={139}/>
};

type Spawner = {
  prevT: number
}

type Game = {
  t: number
  spawner: Spawner
  player: Player
  enemies: Enemy[]
}

const GameView: FC<Game> = ({ t, player, enemies }) => {
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
    </Layer>
}

type GameStage = {
  handleClick: any
  width: number
  height: number
  game: Game
}

const GameStageView: FC<GameStage> = ({ handleClick, width, height, game }) => {
  return <Stage width={width} height={height} className="flex justify-center" onKeyPress={(e) => console.log(e)} onClick={() => handleClick()}>
    <Layer>
      <Rect stroke='black' strokeWidth={4} x={2} y={2} width={width-4} height={height-4} />
    </Layer>
    <GameView {...game} />
  </Stage>
}

// ループで実行したい処理 を callback関数に渡す
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = useRef();
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

const GND = 550

export default function Home() {

  const stageRef = useRef()

  const [game, setGame] = useState({
    t: 0,
    spawner: { prevT: 0 },
    player: {
      t: 0,
      pos: {x: 200, y: GND},
      disp_d: {x: 0, y: 0},
      v: {x: 0, y: 0},
      jumping: true,
    },
    enemies: [{
      pos: {x: 400, y: 450 + 24},
    }],
  })

  useAnimationFrame(() => {
    const dt = 1 / 60.0;

    const player = game.player

    const newT = game.t + dt
    const newSpawner = game.spawner

    const newPlayer = player
    newPlayer.t += dt
    if (newPlayer.jumping) {
      newPlayer.pos.y = player.pos.y + player.v.y * dt
      if (newPlayer.pos.y + 100 < GND) {
        newPlayer.v.y += 2000 * dt
      } else {
        newPlayer.jumping = false;
        newPlayer.pos.y = GND - 100
        newPlayer.v.y = 0
      }

      newPlayer.disp_d = {x:0, y:0}
    } else {
      newPlayer.disp_d = {x:0, y: Math.abs(Math.sin(newPlayer.t * 10)) * -10}
    }

    const newEnemies = game.enemies.map((enemy: Enemy) => {
      return {
        pos: {
          x: enemy.pos.x + dt * (-300),
          y: enemy.pos.y
        },
      }
    }).filter((enemy: Enemy) => {
      return enemy.pos.x >= -100
    })

    // spawn
    if (game.t > newSpawner.prevT + 2.0) {
      newEnemies.push({ pos: { x: 700, y: 450 + 24 }})
      newSpawner.prevT += 2.0
    }

    setGame({
      t: newT,
      spawner: newSpawner,
      player: newPlayer,
      enemies: newEnemies,
    })
  });

  const jump = () => {
    console.log("jump")
    if (!game.player.jumping) {
      //const newPlayer = player
      game.player.jumping = true;
      game.player.v.y = -1000;
      setGame(game)
    }
  }

  const handleClick = () => {
    jump()
  }

  const keyPress = (e) => {
    console.log(e)
    if (e.which == 32) { // space
      jump()
    }
  }

  const W = 600;
  const H = 600;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <GameStageView handleClick={() => handleClick()} width={W} height={H} game={game} />
      </div>
    </main>
  )
}
