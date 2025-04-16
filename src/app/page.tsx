"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ROWS = 6;
const COLS = 7;

type Player = "X" | "O" | null;
type Board = Player[][];

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  function createBoard(): Board {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));
  }

  useEffect(() => {
    checkWinner();
    checkDraw();
  }, [board]);

  const handleMove = (col: number) => {
    if (gameOver || winner) return;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        // Create a new board with the move
        const newBoard = board.map((r, i) =>
          i === row ? r.map((c, j) => (j === col ? currentPlayer : c)) : r
        );

        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        return;
      }
    }

    toast({
      title: "Invalid Move",
      description: "Column is full!",
    });
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
    setCurrentPlayer("X");
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Connect Four</h1>
      <div className="mb-4">
        {!winner && !gameOver ? (
          <p className="text-lg">
            Current Player:{" "}
            <span className="font-semibold text-yellow-500">{currentPlayer}</span>
          </p>
        ) : null}
      </div>
      <div className="max-w-md w-full">
        <div className="grid bg-blue-500 rounded-md shadow-lg">
         <div className="flex">
            {Array.from({ length: COLS }, (_, i) => (
              <div key={i} className="w-14">
                <Button
                  onClick={() => handleMove(i)}
                  className="w-full bg-yellow-400 text-blue-700 hover:bg-yellow-500"
                >
                  Move {i + 1}
                </Button>
              </div>
            ))}
          </div>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="w-14 h-14 flex items-center justify-center"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full ${
                        (rowIndex + colIndex) % 2 === 0
                          ? "bg-blue-200"
                          : "bg-blue-300"
                      }`}
                    >
                      {cell === "X" && (
                        <div className="w-8 h-8 rounded-full bg-red-500" />
                      )}
                      {cell === "O" && (
                        <div className="w-8 h-8 rounded-full bg-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
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
