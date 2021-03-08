import {Injectable} from '@angular/core';
import {BoardCellState} from '../shared/board-cell-state.enum';
import {Position} from '../shared/types';
import {Direction} from '../shared/direction.enum';
import {environment} from '../../environments/environment';
import {LogService} from './log.service';
import {Event, FoodEaten, HeadEntering, StopGame, TailEntering} from '../model/event';

@Injectable({
    providedIn: 'root'
})
export class BoardService {

    public grid: BoardCellState[][] = [];
    public neighbourNames: Map<Direction, string> = new Map<Direction, string>();
    private moveQueue: Direction[] = [];
    public headDirection: Direction = Direction.West;

    private onEvent: (event: Event) => void;

    constructor(private logger: LogService) {
        for (let i = 0; i < environment.boardSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < environment.boardSize; j++) {
                if (i === 0 || i === environment.boardSize - 1 || j === 0 || j === environment.boardSize - 1) {
                    this.grid[i][j] = BoardCellState.Wall;
                } else {
                    this.grid[i][j] = BoardCellState.Free;
                }
            }
        }
        this.onEvent = (event: Event) => {
            this.logger.error('on event method not set yet');
        };
    }

    private _head: Position | null = null;

    get head(): Position | null {
        return this._head;
    }

    set head(value: Position | null) {
        if (value) {
            this.changeGridCells([value], BoardCellState.Head);
        } else {
            this.changeGridCells([this.head!], BoardCellState.Body);
        }
        this._head = value;
    }

    private _tail: Position | null = null;

    get tail(): Position | null {
        return this._tail;
    }

    set tail(value: Position | null) {
        if (value) {
            this.changeGridCells([value], BoardCellState.Tail);
        } else {
            this.changeGridCells([this.tail!], BoardCellState.Free);
        }
        this._tail = value;
    }

    private _food: Position | null = null;

    get food(): Position | null {
        return this._food;
    }

    set food(value: Position | null) {
        this._food = value;
    }

    private _headIndicator: Position | null = null;

    get headIndicator(): Position | null {
        return this._headIndicator;
    }

    set headIndicator(value: Position | null) {
        if (value) {
            this.changeGridCells([value], BoardCellState.HeadIndicator);
        } else {
            this.changeGridCells([this.headIndicator!], BoardCellState.Neighbor);
        }
        this._headIndicator = value;
    }

    private _foodIndicator: Position | null = null;

    get foodIndicator(): Position | null {
        return this._foodIndicator;
    }

    set foodIndicator(value: Position | null) {
        if (value) {
            this.changeGridCells([value], BoardCellState.FoodIndicator);
        } else {
            this.changeGridCells([this.foodIndicator!], BoardCellState.Neighbor);
        }
        this._foodIndicator = value;
    }

    setEventCallback(fn: (event: Event) => void) {
        this.onEvent = fn;
    }

    tick() {

        if (this.head) {
            this.moveQueue.unshift(this.headDirection);
            const newPosition = this.getNewPosition(this.head, this.headDirection);
            this.changeGridCells([this.head], BoardCellState.Body);
            const event = this.detectCollision(newPosition);
            if (event) {
                this.onEvent(event);
            }
            this.head = newPosition;
        }

        if (this.tail) {
            const direction = this.moveQueue.pop();
            if (direction === undefined) {
                this.logger.error(`Tail update without move direction. Deleting the tail`);
                this.tail = null;
            } else {
                const newPosition = this.getNewPosition(this.tail, direction);
                this.changeGridCells([this.tail!], BoardCellState.Free);
                this.changeGridCells([newPosition], BoardCellState.Tail);
                const cellState = this.grid[newPosition.y][newPosition.x];
                if (cellState === BoardCellState.Neighbor) {
                    this.onEvent(new TailEntering(direction, newPosition));
                }
                this.tail = newPosition;
            }
        }

    }

    public setSnake(): void {
        let x = environment.boardSize / 2;
        let y = environment.boardSize / 2;

        this.changeGridCells([{
            x: x,
            y: y
        }], BoardCellState.Head);
        this.head = {
            x: x,
            y: y
        };

        this.headDirection = Direction.West;

        for (let i = 0; i < environment.snakeSize - 2; i++) {
            this.changeGridCells([{
                x: ++x,
                y: y
            }], BoardCellState.Body);
            this.moveQueue.unshift(this.headDirection);
        }

        this.changeGridCells([{
            x: ++x,
            y: y
        }], BoardCellState.Tail);
        this.tail = {
            x: x,
            y: y
        };
    }

    public addNeighbour(direction: Direction, name: string) {
        const positions: Position[] = [];
        const state = BoardCellState.Neighbor;
        const {min, max} = this.findMinMaxNeighbourValues(direction);

        switch (direction) {
            case Direction.North:
                for (let i = min; i < max; i++) {
                    positions.push({
                        x: i,
                        y: 0
                    });
                }
                break;
            case Direction.East:
                for (let i = min; i < max; i++) {
                    positions.push({
                        x: environment.boardSize - 1,
                        y: i
                    });
                }
                break;
            case Direction.South:
                for (let i = min; i < max; i++) {
                    positions.push({
                        x: i,
                        y: environment.boardSize - 1
                    });
                }
                break;
            case Direction.West:
                for (let i = min; i < max; i++) {
                    positions.push({
                        x: 0,
                        y: i
                    });
                }
                break;
        }
        this.changeGridCells(positions, state);

        this.logger.info(`Add neighbour ${name} in ${Direction[direction]}.`);
        this.neighbourNames.set(direction, name);
    }

    public changeGridCells(positions: Position[], cellState: BoardCellState): void {
        this.logger.info(`Update positions ${JSON.stringify(positions)} with cell state ${BoardCellState[cellState]}`);
        positions.forEach(position => {
            this.grid[position.y][position.x] = cellState;
        });
    }

    private detectCollision(position: Position): Event | null {
        const cellState = this.grid[position.y][position.x];

        switch (cellState) {
            case BoardCellState.Body:
                return new StopGame(`Cannibalism`);
            case BoardCellState.Tail:
                return new StopGame(`Ouroboros lol`);
            case BoardCellState.Wall:
                return new StopGame(`Bonk`);
            case BoardCellState.Neighbor:
                return new HeadEntering(this.headDirection, position);
            case BoardCellState.Food:
                return new FoodEaten();
            default:
        }

        return null;
    }

    private getNewPosition(head: Position, direction: Direction): Position {
        let x = head.x;
        let y = head.y;

        switch (direction) {
            case Direction.North:
                y--;
                break;
            case Direction.East:
                x++;
                break;
            case Direction.South:
                y++;
                break;
            case Direction.West:
                x--;
                break;
        }

        return {
            x: x,
            y: y
        };
    }

    private findMinMaxNeighbourValues(direction: Direction): { min: number, max: number } {
        const boundaries = {
            min: 1,
            max: environment.boardSize - 1
        };

        switch (direction) {
            case Direction.North:
                if (this.neighbourNames.has(Direction.West)) {
                    boundaries.min = 0;
                }
                if (this.neighbourNames.has(Direction.East)) {
                    boundaries.max = environment.boardSize;
                }
                break;
            case Direction.East:
                if (this.neighbourNames.has(Direction.North)) {
                    boundaries.min = 0;
                }
                if (this.neighbourNames.has(Direction.South)) {
                    boundaries.max = environment.boardSize;
                }
                break;
            case Direction.South:
                if (this.neighbourNames.has(Direction.West)) {
                    boundaries.min = 0;
                }
                if (this.neighbourNames.has(Direction.East)) {
                    boundaries.max = environment.boardSize;
                }
                break;
            case Direction.West:
                if (this.neighbourNames.has(Direction.North)) {
                    boundaries.min = 0;
                }
                if (this.neighbourNames.has(Direction.South)) {
                    boundaries.max = environment.boardSize;
                }
                break;
        }
        return boundaries;
    }
}
