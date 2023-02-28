import React from "react";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Route, NavLink, BrowserRouter, Routes } from 'react-router-dom';

import "./index.css";
import pvpIcon from './assets/imgs/group.png';
import pveIcon from './assets/imgs/single.png';

function Square(props) {
    return (
        <button
            className={"square " + (props.isWinning ? "square--winning" : null)}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class TTT extends React.Component {
    renderSquare(i) {
        return (
            <Square
                isWinning={this.props.winningSquares.includes(i)}
                key={"square " + i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let boardToRender = [];
        for (var i = 0; i < 9; i += 3) {
            let row = [];
            for (var j = 0; j < 3; j++) {
                row.push(this.renderSquare(i + j));
            }
            boardToRender.push(<div className="board-row">{row}</div>);
        }

        return <div>{boardToRender}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                },
            ],
            stepNumber: 0,
            xIsNext: true,
            sortHistoryDesc: false,
            gameType: 0,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                },
            ]),
            stepNumber: history.length,
        });

        if( this.state.gameType === 2 ) {
            this.setState({
                xIsNext: !this.state.xIsNext,
            });
        }

        if ( this.state.gameType === 1 && squares.includes(null) ) {
           let botDecision = minimax(squares, this.state.stepNumber, !this.state.xIsNext);
           this.setState({
           history: history.concat([
                {
                    squares: botDecision.choice,
                },
            ]),
            stepNumber: history.length,
            });
        }
    }

    sortHistorySwitch() {
        this.setState({
            sortHistoryDesc: !this.state.sortHistoryDesc,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const AlwaysScrollToBottom = () => {
            const elementRef = useRef();
            useEffect(() => elementRef.current.scrollIntoView());
            return <div ref={elementRef} />;
        };

        const moves = history.map((step, move) => {
            const desc = move
                ? "Go to move #" + (move + 1)
                : "Go to game start";
            return (
                <li key={move}>
                    <div
                        style={
                            this.state.stepNumber === move
                                ? { background: "#9F496E", margin: "20px" }
                                : null
                        }
                        >
                        <div className="scale-info">
                            <TTT
                                winningSquares={[]}
                                squares={history[move].squares}
                            />
                        </div>
                    </div>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                    <AlwaysScrollToBottom />
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner.player;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        let tie = 0;
        if ( current.squares.every(element => element !== null) && !calculateWinner(current.squares) ) tie = 1;

        let showGame;
        if (this.state.gameType) {
            showGame = <div className="game">
                                    <TTT
                                        winningSquares={winner ? winner.line : []}
                                        squares={current.squares}
                                        onClick={(i) => this.handleClick(i)}
                                    />
                                    {tie ? "The game is a draw" : status}
                                 </div>;
         } else {
             showGame = <div className="game-select">
                                    <img src={pveIcon} alt="Click to select PvE" id='single' onClick={() => this.setState({gameType: 1,})} />
                                    <img src={pvpIcon} alt="Click to select PvP" id='multi' onClick={() => this.setState({gameType: 2,})} />
                                 </div>;
         }

        return (
            <div className="flex-container">
                <div className="content">
                    {showGame}
                    <div className="game-info">
                        <b>Turn History</b>
                        {this.state.sortHistoryDesc ? (
                            <ol reversed>{moves.reverse()}</ol>
                        ) : (
                            <ol>{moves}</ol>
                        )}
                        <button
                            onClick={() => this.sortHistorySwitch()}
                            style={{
                                margin: "20px",
                                width: "80%",
                                height: "10%",
                                flexShrink: "0",
                            }}
                        >
                            Sort by:{" "}
                            {this.state.sortHistoryDesc
                                ? "Descending"
                                : "Ascending"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
            <div className="flex-container">
                <div className="banner">Long's Playground</div>
                    <BrowserRouter>
                        <ul className="navbar">
                            <li><NavLink exact to='/'>Tic-Tac-Toe</NavLink></li>
                        </ul>
                        <Routes>
                            <Route exact path='/' element={ <Game /> } />
                        </Routes>
                    </BrowserRouter>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />, 
    document.getElementById("root")
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return { player: squares[a], line: [a, b, c] };
        }
    }
    return null;
}

function score(game, depth) {
    const result = calculateWinner(game);
    
    if (result) {
        if (result.player === 'O') {
            return (10 - depth);
        } else {
            return (depth - 10);
        }
    } else {
        return 0;
    }
}

function minimax(game, depth, xIsNext) {
    if ( calculateWinner(game) || game.every(element => element !== null) ) return score(game, depth);

    depth += 1;
    let scores = [];
    let moves = [];

    for (let i = 0; i < game.length; i++) {
        if (game[i] === null) {
            xIsNext ? game[i] = 'X' : game[i] = 'O';
            let mmScore = minimax(game, depth, !xIsNext);

            if (typeof mmScore === 'number') {
                scores.push(mmScore);
            } else {
                scores.push(mmScore.finalScore);
            }

            moves.push( game.slice() );
            game[i] = null;
        }
    }

    if (!xIsNext) {
        let max = Math.max(...scores);
        let maxIndex = scores.indexOf(max);
        return { choice: moves[maxIndex], finalScore: scores[maxIndex] };
    } else {
        let min = Math.min(...scores);
        let minIndex = scores.indexOf(min);
        return { choice: moves[minIndex], finalScore: scores[minIndex] };
    }
}