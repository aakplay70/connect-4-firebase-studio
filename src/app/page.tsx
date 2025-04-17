"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-dom-confetti';

const ROWS = 6;
const COLS = 7;

type Player = "Red" | "Yellow" | null;
type Board = Player[][];

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("Red");
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  const boardRef = useRef<HTMLDivElement>(null);
  const [confetti, setConfetti] = useState(false);

  function createBoard(): Board {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));
  }

  useEffect(() => {
    checkWinner();
    checkDraw();
  }, [board]);

  useEffect(() => {
    if (winner) {
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
      }, 3000);
    }
  }, [winner]);

  const handleMove = (col: number) => {
    if (gameOver || winner) return;

    // Find the next available row in the selected column
    let rowToDrop = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        rowToDrop = row;
        break;
      }
    }

    if (rowToDrop === -1) {
      toast({
        title: "Invalid Move",
        description: "Column is full!",
      });
      return;
    }

    // Create a new board with the move
    const newBoard = board.map((r, i) =>
      i === rowToDrop ? r.map((c, j) => (j === col ? currentPlayer : c)) : r
    );

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "Red" ? "Yellow" : "Red");
  };

  const checkWinner = () => {
    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row][col + 1] &&
          board[row][col] === board[row][col + 2] &&
          board[row][col] === board[row][col + 3]
        ) {
          setWinner(board[row][col]);
          setGameOver(true);
          toast({
            title: "We have a winner!",
            description: `Player ${board[row][col]} wins!`,
          });
          return;
        }
      }
    }

    // Vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col] &&
          board[row][col] === board[row + 2][col] &&
          board[row][col] === board[row + 3][col]
        ) {
          setWinner(board[row][col]);
          setGameOver(true);
          toast({
            title: "We have a winner!",
            description: `Player ${board[row][col]} wins!`,
          });
          return;
        }
      }
    }

    // Diagonal (top-left to bottom-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col + 1] &&
          board[row][col] === board[row + 2][col + 2] &&
          board[row][col] === board[row + 3][col + 3]
        ) {
          setWinner(board[row][col]);
          setGameOver(true);
          toast({
            title: "We have a winner!",
            description: `Player ${board[row][col]} wins!`,
          });
          return;
        }
      }
    }

    // Diagonal (top-right to bottom-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col - 1] &&
          board[row][col] === board[row + 2][col - 2] &&
          board[row][col] === board[row + 3][col - 3]
        ) {
          setWinner(board[row][col]);
          setGameOver(true);
          toast({
            title: "We have a winner!",
            description: `Player ${board[row][col]} wins!`,
          });
          return;
        }
      }
    }
  };

  const checkDraw = () => {
    if (gameOver) return;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!board[row][col]) {
          return;
        }
      }
    }

    setGameOver(true);
    toast({
      title: "It's a Draw!",
      description: "No one wins.",
    });
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer("Red");
    setWinner(null);
    setGameOver(false);
    setConfetti(false);
  };

  const confettiConfig = {
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: 200,
    dragFriction: 0.1,
    duration: 3000,
    colors: ["#FFC107", "#29ABE2", "#FFFFFF"],
    width: "10px",
    height: "10px",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Connect Four Fun</h1>
      <Confetti active={confetti} config={confettiConfig} />
      <div className="mb-4">
        {!winner && !gameOver ? (
          <p className="text-lg">
            Current Player:{" "}
            <span className={`font-semibold text-${currentPlayer === "Red" ? "red" : "yellow"}-500`}>
              {currentPlayer}
            </span>
          </p>
        ) : null}
      </div>
      <div className="max-w-md w-full">
        <div className="grid bg-blue-500 rounded-md shadow-lg">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ height: "65px" }}>
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="w-full h-full flex items-center justify-center p-1"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full ${
                        (rowIndex + colIndex) % 2 === 0
                          ? "bg-blue-200"
                          : "bg-blue-300"
                      }`}
                    >
                      {cell === "Red" && (
                        <div className="w-10 h-10 rounded-full bg-red-500" />
                      )}
                      {cell === "Yellow" && (
                        <div className="w-10 h-10 rounded-full bg-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        <div className="grid grid-cols-7">
          {Array.from({ length: COLS }, (_, i) => (
            <div key={i} className="w-full">
              <Button
                onClick={() => handleMove(i)}
                className="w-full bg-rose-100 text-blue-700 hover:bg-accent"
              >
                Here
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {!winner && !gameOver ? null : (
          <Button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-700 text-white"
          >
            Reset Game
          </Button>
        )}
      </div>
    </div>
  </div>
  );
}
