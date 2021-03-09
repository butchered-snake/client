import {Component, OnDestroy, OnInit} from '@angular/core';
import {BoardService} from '../../../common/services/board.service';
import {BoardCellState} from '../../../common/shared/board-cell-state.enum';
import {faCarrot} from '@fortawesome/free-solid-svg-icons';
import {Direction} from '../../../common/shared/direction.enum';
import {ClientService} from '../../../common/services/client.service';
import {LogService} from '../../../common/services/log.service';
import {fromEvent, Subscription} from 'rxjs';
import {NbDialogService} from '@nebular/theme';
import {Router} from '@angular/router';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

    public foodIcon = faCarrot;
    public boardCellState = BoardCellState;
    public direction = Direction;
    private keyPressSubscription: Subscription;

    constructor(private logger: LogService, public boardService: BoardService, public clientService: ClientService,
                private dialogService: NbDialogService, private router: Router) {
        const keyEvent = fromEvent(document, 'keyup');
        this.keyPressSubscription = keyEvent.subscribe(event => {
            switch ((event as KeyboardEvent).key) {
                case 'd':
                case 'ArrowRight':
                    this.boardService.headDirection = Direction.East;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.boardService.headDirection = Direction.West;
                    break;
                case 'w':
                case 'ArrowUp':
                    this.boardService.headDirection = Direction.North;
                    break;
                case 's':
                case 'ArrowDown':
                    this.boardService.headDirection = Direction.South;
                    break;
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.keyPressSubscription.unsubscribe();
    }
}
