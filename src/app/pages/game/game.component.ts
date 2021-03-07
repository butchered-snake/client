import {Component, OnInit} from '@angular/core';
import {BoardService} from '../../../common/services/board.service';
import {BoardCellState} from '../../../common/shared/board-cell-state.enum';
import {faCarrot} from '@fortawesome/free-solid-svg-icons';
import {Direction} from '../../../common/shared/direction.enum';
import {AdminClientService} from '../../../common/services/admin-client.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

    public foodIcon = faCarrot;
    public boardCellState = BoardCellState;
    public direction = Direction;

    constructor(public boardService: BoardService, private adminClient: AdminClientService) {
    }

    ngOnInit(): void {
    }

}
