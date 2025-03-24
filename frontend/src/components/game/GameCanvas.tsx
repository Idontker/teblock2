"use client";
import { useRef, useState, useEffect } from "react";
import { Play, Square, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameCanvasProps = {
  // Code to run the game must be passed as props
  userCode: string;
  prefixCode: string;
  suffixCode: string;
};

export default function GameCanvas({
  userCode,
  prefixCode,
  suffixCode,
}: GameCanvasProps) {
  const [isRunning, setIsRunningState] = useState(false);
  const isRunningRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const setIsRunning = (value: boolean) => {
    isRunningRef.current = value;
    setIsRunningState(value);
  };

  const startGame = () => {
    console.log("Starting game...");
    if (isRunningRef.current) return;
    setIsRunning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const fullCode = prefixCode + userCode + suffixCode;
      const gameFunction = new Function("context", "canvas", "time", fullCode);
      const startTime = performance.now();

      const animate = (time: number) => {
        if (!isRunningRef.current) return;
        const elapsed = time - startTime;
        try {
          context.clearRect(0, 0, canvas.width, canvas.height);
          gameFunction(context, canvas, elapsed);
        } catch (error) {
          console.error("Error in game code:", error);
          stopGame();
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error compiling game code:", error);
      stopGame();
    }
  };

  const stopGame = () => {
    console.log("Stopping the game");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRunning(false);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="md:w-1/2 flex flex-col h-full">
      <div className="py-4 mx-auto flex-1 bg-muted/20">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="h-full border bg-white"
        />
      </div>
      <div className="flex justify-center m-8 gap-4">
        <Button
          variant="outline"
          onClick={startGame}
          disabled={isRunning}
          className="w-24"
        >
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        <Button
          variant="outline"
          onClick={stopGame}
          disabled={!isRunning}
          className="w-24"
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        <Button variant="outline" onClick={resetCanvas} className="w-24">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
