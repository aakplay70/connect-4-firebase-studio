"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-dom-confetti';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import './styles.css';

const ROWS = 6;
const COLS = 7;

type Player = "Red" | "Yellow" | null;
type Board = Player[][];

function checkWinner(board: Board): { player: Player; sequence: number[][] } | null {
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] &&
        board[row][col] === board[row][col + 1] &&
        board[row][col] === board[row][col + 2] &&
        board[row][col] === board[row][col + 3]
      ) {
        return {
          player: board[row][col],
          sequence: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]],
        };
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
        return {
          player: board[row][col],
          sequence: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]],
        };
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
        return {
          player: board[row][col],
          sequence: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]],
        };
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
        return {
          player: board[row][col],
          sequence: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]],
        };
      }
    }
  }

  return null;
}

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("Red");
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  const boardRef = useRef<HTMLDivElement>(null);
  const [confetti, setConfetti] = useState(false);
  const [winningSequence, setWinningSequence] = useState<number[][]>([]);
  const [flash, setFlash] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [youScore, setYouScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const gameWonRef = useRef(false);
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);

  function createBoard(): Board {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));
  }

  useEffect(() => {
    const result = checkWinner(board);
    if (result && !gameWonRef.current) {
      gameWonRef.current = true; // Prevent multiple score updates

      setWinningSequence(result.sequence);
      setWinner(result.player);
      setGameOver(true);

      if (result.player === "Red") {
        setYouScore(prevScore => prevScore + 1);
      } else {
        setComputerScore(prevScore => prevScore + 1);
      }
    } else {
      checkDraw();
    }
  }, [board]);

  useEffect(() => {
    if (winner) {
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
      }, 3000);
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
      }, 2000);
    }
  }, [winner]);

  useEffect(() => {
    if (currentPlayer === "Yellow" && !gameOver && !winner && !gameWonRef.current) {
      // It's the computer's turn
      setTimeout(() => {
        let computerMove;
        if (difficulty === "easy") {
          computerMove = getRandomMove(board);
        } else if (difficulty === "medium") {
          computerMove = getMediumMove(board);
        }
        else {
          computerMove = getHardMove(board);
        }

        if (computerMove !== null) {
          handleMove(computerMove);
        }
      }, 500); // Delay for the computer's move
    }
    if (gameOver) {
          return;
        }
  }, [currentPlayer, gameOver, winner, difficulty, board, gameWonRef]);

  const getRandomMove = (board: Board): number | null => {
    const availableColumns: number[] = [];
    for (let col = 0; col < COLS; col++) {
      if (!board[0][col]) {
        availableColumns.push(col);
      }
    }

    if (availableColumns.length === 0) {
      return null; // No moves available
    }

    const randomColumnIndex = Math.floor(Math.random() * availableColumns.length);
    return availableColumns[randomColumnIndex];
  };

  // Basic medium level AI
  const getMediumMove = (board: Board): number | null => {
    // Check if the AI can win in the next move
    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Yellow");
      if (tempBoard && checkWinner(tempBoard)?.player === "Yellow") {
        return col;
      }
    }

    // Check if the player can win in the next move and block them
    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Red");
      if (tempBoard && checkWinner(tempBoard)?.player === "Red") {
        return col;
      }
    }

    // If no winning or blocking move, make a random move
    return getRandomMove(board);
  };

    // Hard AI
    const getHardMove = (board: Board): number | null => {
      // Check if the AI can win in the next move
      for (let col = 0; col < COLS; col++) {
        const tempBoard = makeMove(board, col, "Yellow");
        if (tempBoard && checkWinner(tempBoard)?.player === "Yellow") {
          return col;
        }
      }
  
      // Check if the player can win in the next move and block them
      for (let col = 0; col < COLS; col++) {
        const tempBoard = makeMove(board, col, "Red");
        if (tempBoard && checkWinner(tempBoard)?.player === "Red") {
          return col;
        }
      }
  
      // Try to make a strategic move
      for (let col = 0; col < COLS; col++) {
        const tempBoard = makeMove(board, col, "Yellow");
        if (tempBoard) {
          // Check if this move leads to a favorable outcome
          // (e.g., sets up a potential win or prevents the player from winning)
          if (isFavorableMove(tempBoard, "Yellow")) {
            return col;
          }
        }
      }
  
      // If no strategic move, make a random move
      return getRandomMove(board);
    };
  
    // Helper function to check if a move is favorable for the AI
    const isFavorableMove = (board: Board, player: Player): boolean => {
      // Check if the move leads to a potential win or prevents the player from winning
      // This is a simplified example, and you can add more sophisticated logic here
      return false;
    };

  const makeMove = (board: Board, col: number, player: Player): Board | null => {
    let rowToDrop = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        rowToDrop = row;
        break;
      }
    }

    if (rowToDrop === -1) {
      return null; // Column is full
    }

    // Create a new board with the move
    const newBoard = board.map((r, i) =>
      i === rowToDrop ? r.map((c, j) => (j === col ? player : c)) : r
    );

    return newBoard;
  };

  const handleMove = (col: number) => {
    if (gameOver || winner || gameWonRef.current) return;

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
    setHighlightedColumn(null);
  };


  const checkDraw = () => {
    if (gameOver || gameWonRef.current) return;
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
    setWinningSequence([]);
    gameWonRef.current = false;
    setHighlightedColumn(null);
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
      <div className="flex space-x-4 mb-2">
        <div>You: {youScore}</div>
        <div>Computer: {computerScore}</div>
      </div>
      <div className="flex flex-row items-center justify-between mb-2 w-full max-w-md">
      {winner && (
          <Button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-700 text-white mt-2"
          >
            Reset Game
          </Button>
        )}
        <Select onValueChange={setDifficulty} defaultValue={difficulty} className="ml-auto">
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        </div>
      
      <div className="max-w-md w-full">
        <div className="grid bg-blue-500 rounded-md shadow-lg">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ height: "65px" }}
              onMouseEnter={() => setHighlightedColumn(rowIndex)}
              onMouseLeave={() => setHighlightedColumn(null)}
              onClick={() => highlightedColumn !== null ? handleMove(highlightedColumn) : null}
            >
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-full h-full flex items-center justify-center p-1 ${highlightedColumn === colIndex ? 'hovered-column' : ''}`}
                  
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full ${
                        (rowIndex + colIndex) % 2 === 0
                          ? "bg-blue-200"
                          : "bg-blue-300"
                      } ${
                        flash && winningSequence.some(seq => seq[0] === rowIndex && seq[1] === colIndex)
                          ? "animate-ping bg-opacity-75"
                          : ""
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
        </div>
      </div>
    </div>
  );
}
