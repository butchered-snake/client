import {Injectable} from '@angular/core';
import {BoardCellState} from '../shared/board-cell-state.enum';
import {Position} from '../shared/types';
import {Direction} from '../shared/direction.enum';
import {environment} from '../../environments/environment';
import {LogService} from './log.service';

@Injectable({
    providedIn: 'root'
})
export class BoardService {

    public grid: BoardCellState[][] = [];
    private neighbourNames: Map<Direction, string> = new Map<Direction, string>();

    constructor(private logger: LogService) {
        for (let i = 0; i < environment.boardSize; i++) {
            this.grid.push([]);
            for (let j = 0; j < environment.boardSize; j++) {
                this.grid[i].push(BoardCellState.Free);
            }
        }
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
}
