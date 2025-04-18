"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import './styles.css';
import Confetti from 'react-dom-confetti';

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
  const [youScore, setYouScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [lastLoser, setLastLoser] = useState<Player>(null);
  const [isRedNext, setIsRedNext] = useState(true);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [winner, setWinner] = useState<Player>(null);
  const [winningSequence, setWinningSequence] = useState<number[][]>([]);
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [flash, setFlash] = useState(false);
  const { toast } = useToast();
  const gameWonRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const initialBoard = useCallback(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(null)), []);
  const [board, setBoard] = useState<Board>(initialBoard());
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const result = checkWinner(board);
    if (result && !gameWonRef.current) {
      gameWonRef.current = true;
      setWinningSequence(result.sequence);
      setWinner(result.player);
      setGameOver(true);
      if (result.player === "Red") {
        setYouScore(prevScore => prevScore + 1);
        setLastLoser("Yellow");
      } else {
        setComputerScore(prevScore => prevScore + 1);
        setLastLoser("Red");
      }
      setConfetti(true);
      setFlash(true);

      setTimeout(() => setConfetti(false), 3000);
      setTimeout(() => setFlash(false), 2000);
    } else if (!winner) {
      checkDraw();
    }
  }, [board, winner]);

  useEffect(() => {
    if (!isRedNext && !gameOver && !winner && !gameWonRef.current) {
      const getComputerMove = () => {
        let computerMove;
        switch (difficulty) {
          case "easy":
            computerMove = getRandomMove(board, 2);
            break;
          case "medium":
            computerMove = getMediumMove(board, 3);
            break;
          case "hard":
            computerMove = getHardMove(board, 4);
            break;
          default:
            computerMove = getRandomMove(board, 2);
        }
        if (computerMove !== null) {
          handleMove(computerMove);
        }
      };

      setTimeout(getComputerMove, 500);
    }
  }, [isRedNext, gameOver, winner, difficulty, board, gameWonRef]);

  const getRandomMove = useCallback((board: Board, scope: number): number | null => {
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
  }, []);

  const getMediumMove = useCallback((board: Board, scope: number): number | null => {
    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Yellow");
      if (tempBoard && checkWinner(tempBoard)?.player === "Yellow") {
        return col;
      }
    }

    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Red");
      if (tempBoard && checkWinner(tempBoard)?.player === "Red") {
        return col;
      }
    }

    return getRandomMove(board, scope);
  }, [getRandomMove]);

  const getHardMove = useCallback((board: Board, scope: number): number | null => {
    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Yellow");
      if (tempBoard && checkWinner(tempBoard)?.player === "Yellow") {
        return col;
      }
    }

    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Red");
      if (tempBoard && checkWinner(tempBoard)?.player === "Red") {
        return col;
      }
    }

    for (let col = 0; col < COLS; col++) {
      const tempBoard = makeMove(board, col, "Yellow");
      if (tempBoard) {
        if (isFavorableMove(tempBoard, "Yellow", scope)) {
          return col;
        }
      }
    }

    return getRandomMove(board, scope);
  }, [getRandomMove]);

  const isFavorableMove = useCallback((board: Board, player: Player, scope: number): boolean => {
    return false;
  }, []);

  const makeMove = useCallback((board: Board, col: number, player: Player): Board | null => {
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

    const newBoard = board.map((r, i) =>
      i === rowToDrop ? r.map((c, j) => (j === col ? player : c)) : r
    );

    return newBoard;
  }, []);

  const handleMove = useCallback((col: number) => {
    if (gameOver || winner || gameWonRef.current) return;

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

    const newBoard = board.map((r, i) =>
      i === rowToDrop ? r.map((c, j) => (j === col ? (isRedNext ? "Red" : "Yellow") : c)) : r
    );

    setBoard(newBoard);
    setIsRedNext(!isRedNext);
    setHighlightedColumn(null);
  }, [board, isRedNext, gameOver, winner, toast]);

  const checkDraw = useCallback(() => {
    if (gameOver || gameWonRef.current) return;
    if (board.every(row => row.every(cell => cell !== null))) {
      setGameOver(true);
      toast({
        title: "It's a Draw!",
        description: "No one wins.",
      });
    }
  }, [board, gameOver]);

  const resetGame = useCallback(() => {
    setBoard(initialBoard());
    setWinner(null);
    setGameOver(false);
    setConfetti(false);
    setWinningSequence([]);
    gameWonRef.current = false;
    setHighlightedColumn(null);
    setIsRedNext(lastLoser === "Yellow" || lastLoser === null);
  }, [lastLoser, initialBoard]);

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

  const handleMouseEnter = (colIndex: number) => {
    setHighlightedColumn(colIndex);
  };

  const handleMouseLeave = () => {
    setHighlightedColumn(null);
  };

  const handleGridClick = (colIndex: number) => {
    handleMove(colIndex);
  };

  useEffect(() => {
    if (lastLoser === null) {
      setIsRedNext(true);
    } else {
      setIsRedNext(lastLoser === "Yellow");
    }
  }, [lastLoser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-4">
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          {...confettiConfig}
        />
      )}
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Connect Four Fun</h1>
      <div className="flex items-center justify-between mb-2 w-full max-w-md">
        <Button
          onClick={resetGame}
          className={cn("bg-blue-500 hover:bg-blue-700 text-white mt-2", winner ? '' : 'hidden')}
        >
          Play Again
        </Button>

        <div className="flex space-x-4">
          <div>You: {youScore}</div>
          <div>Computer: {computerScore}</div>
        </div>
        <Select onValueChange={setDifficulty} defaultValue={difficulty} className="w-[120px] h-8">
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
        <div className="grid bg-blue-500 rounded-md shadow-lg"
          ref={boardRef}
        >
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ height: "65px" }}
            >
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-full h-full flex items-center justify-center p-1 ${highlightedColumn === colIndex ? 'hovered-column' : ''}`}
                  onClick={() => handleGridClick(colIndex)}
                  onMouseEnter={() => handleMouseEnter(colIndex)}
                  onMouseLeave={() => handleMouseLeave()}
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

