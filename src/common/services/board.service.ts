import {Injectable} from '@angular/core';
import {BoardCellState} from '../shared/board-cell-state.enum';
import {Position} from '../shared/types';
import {Direction} from '../shared/direction.enum';
import {environment} from '../../environments/environment';
import {LogService} from './log.service';
import {Event} from '../model/event';

@Injectable({
    providedIn: 'root'
})
export class BoardService {

    public grid: BoardCellState[][] = [];
    public neighbourNames: Map<Direction, string> = new Map<Direction, string>();

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
        this.onEvent = (event: Event) => {this.logger.error("on event method not set yet")};
    }

    setEventCallback(fn: (event: Event) => void) {
        this.onEvent = fn;
    }

    private _head: Position | null = null;

    get head(): Position | null {
        return this._head;
    }

    set head(value: Position | null) {
        this._head = value;
    }

    private _tail: Position | null = null;

    get tail(): Position | null {
        return this._tail;
    }

    set tail(value: Position | null) {
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
        this._headIndicator = value;
    }

    private _foodIndicator: Position | null = null;

    get foodIndicator(): Position | null {
        return this._foodIndicator;
    }

    set foodIndicator(value: Position | null) {
        this._foodIndicator = value;
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

        console.log(`Add neighbour in ${Direction[direction]}. Positions: ${JSON.stringify(positions)}. min: ${min}. max: ${max}`);

        this.neighbourNames.set(direction, name);
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

    private changeGridCells(positions: Position[], cellState: BoardCellState): void {
        positions.forEach(position => {
            this.grid[position.y][position.x] = cellState;
        });
    }
}
