import {Component, OnInit} from '@angular/core';
import {BoardService} from '../../../common/services/board.service';
import {BoardCellState} from '../../../common/shared/board-cell-state.enum';
import {faCarrot} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

    public foodIcon = faCarrot;

    public boardCellState = BoardCellState;

    constructor(public boardService: BoardService) {
    }

    ngOnInit(): void {
    }

}
