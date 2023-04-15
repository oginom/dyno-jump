import { Layer, Rect, Circle, Ellipse, Line, Stage, Image } from "react-konva";
import { Inter } from 'next/font/google'
import { useCallback, useEffect, useRef, useState } from "react";
import useImage from 'use-image';

const inter = Inter({ subsets: ['latin'] })

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

const LionImage = (props) => {
  const [image] = useImage('https://konvajs.org/assets/lion.png')
  return <Image image={image} x={props.x} y={props.y}/>
};

export default function Home() {

  const [circle1, setCircle1] = useState(0);

  useAnimationFrame(() => {
    setCircle1(circle1 + 0.1);
  });

  const handleClick = (dx: number) => {
    console.log(dx)
    setCircle1(circle1+dx)
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Stage width={500} height={500}>
          <Layer>
            <Rect stroke='black' strokeWidth={4} x={5} y={5} width={490} height={490} />
            <Rect fill='red' x={100} y={100} width={300} height={200} />
            <Rect stroke='black' strokeWidth={4} x={5} y={5} width={490} height={490} />
            <Rect fill='red' x={400} y={350} width={50} height={50} onClick={() => handleClick(10)} />
            <Rect fill='blue' x={50} y={350} width={50} height={50} onClick={() => handleClick(-10)} />
            <Circle fill='blue' x={circle1} y={100} radius={50} opacity={0.5} />
            <Ellipse fill='green' x={250} y={300} radiusX={100} radiusY={180} />
            <Line points={[400, 50, 300, 150, 150, 170, 300, 50]} stroke='purple' strokeWidth={15} />
            <LionImage x={circle1} y={10}/>
          </Layer>
        </Stage>
      </div>
    </main>
  )
}
