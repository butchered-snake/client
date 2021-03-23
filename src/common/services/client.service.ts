import {Injectable, NgZone} from '@angular/core';
import {LogService} from './log.service';
import {
    ConnectionEstablished,
    Event,
    FoodPosUpdate,
    HeadEntering,
    HeadPosLeavingContext,
    HeadPosUpdate,
    PlacedFood,
    ProvideAnswer,
    ProvideOffer,
    RequestOffer,
    SetClientId,
    SetFood,
    StopGame,
    TailEntering
} from '../model/event';
import {EventType} from '../shared/event-type.enum';
import {ClientId} from '../model/client-id';
import {Neighbour} from '../model/neighbour';
import {Direction} from '../shared/direction.enum';
import {BoardService} from './board.service';
import {RTCClient} from '../model/rtc-client';
import {LocalRTCClient} from '../model/local-rtc-client';
import {RemoteRTCClient} from '../model/remote-rtc-client';
import {Position} from '../shared/types';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs';
import {GameStoppedDialogComponent} from '../dialogs/game-stopped-dialog/game-stopped-dialog.component';
import {NbDialogService} from '@nebular/theme';
import {Router} from '@angular/router';
import {BoardCellState} from '../shared/board-cell-state.enum';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    public name: string = '';
    public gameStarted: Subject<void>;
    private id: ClientId;
    private neighbours: Map<Direction, Neighbour>;
    private adminConnection: RemoteRTCClient | null = null;

    constructor(private logger: LogService, private board: BoardService, private ngZone: NgZone, private dialogService: NbDialogService, private router: Router) {
        this.gameStarted = new Subject<void>();
        this.id = new ClientId(0);
        this.neighbours = new Map();
        this.board.setEventCallback(this.processBoardEvent.bind(this));
    }

    public initializeService(connection: RemoteRTCClient, name: string) {
        this.adminConnection = connection;
        this.name = name;

        this.adminConnection.setOnEventCallback(this.processAdminEvent.bind(this));

        this.logger.info('ClientService init', name);
    }

    addNeighbour(direction: Direction, neighbourId: ClientId, connection: RTCClient) {
        const n: Neighbour = new Neighbour(this.logger, neighbourId, connection, this.processNeighbourEvent.bind(this));
        this.neighbours.set(direction, n);
    }

    processNeighbourEvent(event: Event) {
        this.ngZone.run(() => {
            switch (event.type) {
                case EventType.HeadPosUpdate:
                    this.board.headIndicator = this.getNewHeadIndicatorPosition(event as HeadPosUpdate);
                    this.board.foodIndicator = this.board.foodIndicator;
                    break;
                case EventType.HeadEntering:
                    const headEntering: HeadEntering = (event as HeadEntering);
                    const newHeadPosition = this.getNewPosFromDirectionalPos(headEntering.direction, headEntering.oldPos, 'head');

                    switch (this.board.grid[newHeadPosition.y][newHeadPosition.x]) {
                        case BoardCellState.Tail:
                        case BoardCellState.Body:
                            this.logger.error('Collision in head entering');
                            this.adminConnection?.sendMessage(new StopGame('Cannibalism'));
                            break;
                        default:
                    }

                    this.board.head = newHeadPosition;
                    this.board.headDirection = headEntering.direction;
                    this.board.headIndicator = null;
                    break;
                case EventType.TailEntering:
                    const tailEntering: TailEntering = (event as TailEntering);
                    this.board.tail = this.getNewPosFromDirectionalPos(tailEntering.direction, tailEntering.oldPos, 'tail');
                    break;
                case EventType.HeadPosLeavingContext:
                    this.board.headIndicator = null;
                    break;
            }
        });

    }

    processBoardEvent(event: Event) {
        this.ngZone.run(() => {
            switch (event.type) {
                case EventType.FoodEaten:
                    this.adminConnection!.sendMessage(event);
                    break;
                case EventType.HeadEntering:
                    const headEntering: HeadEntering = (event as HeadEntering);
                    this.sendEventToNeighbour(headEntering.direction, headEntering);
                    this.neighbours.forEach((neighbour: Neighbour, direction: Direction) => {
                        if (direction !== headEntering.direction) {
                            neighbour.connection.sendMessage(new HeadPosLeavingContext(direction));
                        }
                    });
                    break;
                case EventType.TailEntering:
                    const tailEntering: TailEntering = (event as TailEntering);
                    this.sendEventToNeighbour(tailEntering.direction, tailEntering);
                    break;
                case EventType.PlacedFood:
                    this.adminConnection!.sendMessage(event);
                    break;
                case EventType.HeadPosUpdate:
                    const headPosUpdate: HeadPosUpdate = (event as HeadPosUpdate);
                    this.neighbours.forEach((connection: Neighbour, direction: Direction) => {
                        connection.connection.sendMessage(new HeadPosUpdate(direction, headPosUpdate.newPos));
                    });
                    break;
                case EventType.StopGame:
                    this.adminConnection!.sendMessage(event);
                    break;
            }
        });
    }

    processAdminEvent(event: Event) {
        this.ngZone.run(() => {
            let neighbourId: ClientId;
            let direction: Direction;

            switch (event.type) {
                case EventType.StopGame:
                    this.dialogService.open(GameStoppedDialogComponent, {}).onClose.subscribe(args => {
                        this.router.navigate(['/new-game'], {}).then(value => {
                            window.location.reload();
                        });
                    });
                    break;
                case EventType.Tick:
                    this.board.tick();
                    break;
                case EventType.StartGame:
                    this.logger.info('Game started');
                    this.gameStarted.next();
                    break;
                case EventType.PlaceSnake:
                    this.board.setSnake();
                    break;
                case EventType.SetFood:
                    const setFood: SetFood = (event as SetFood);
                    this.adminConnection!.sendMessage(new PlacedFood(this.board.placeFood(), this.id.id));
                    break;
                case EventType.FoodPosUpdate:
                    if (this.board.food) {
                        this.board.foodIndicator = null;
                        break;
                    }
                    this.board.elongateTail();
                    this.board.foodIndicator = this.getNewFoodIndicatorPosition(event as FoodPosUpdate);
                    break;
                case EventType.FoodEaten:
                    this.board.elongateTail();
                    break;
                case EventType.SetClientId:
                    const setClientId: SetClientId = (event as SetClientId);
                    this.id = new ClientId(setClientId.id);
                    this.logger.info('Set client id', setClientId.id);
                    break;
                case EventType.RequestOffer:
                    const requestOffer: RequestOffer = (event as RequestOffer);
                    neighbourId = new ClientId(requestOffer.from);
                    direction = this.getNeighbourDirection(neighbourId);
                    const localConnection: LocalRTCClient = new LocalRTCClient(this.logger);
                    let gotOffer: boolean = false;
                    localConnection.newIceCandidate.subscribe(offer => {
                        if (gotOffer) {
                            return;
                        }
                        this.adminConnection?.sendMessage(new ProvideOffer(this.id.id, '', neighbourId.id, JSON.stringify(offer)));
                        gotOffer = true;
                    });
                    localConnection.createNewOffer();
                    this.addNeighbour(direction, neighbourId, localConnection);
                    this.board.addNeighbour(direction, requestOffer.fromName);
                    break;
                case EventType.ProvideOffer:
                    const provideOffer: ProvideOffer = (event as ProvideOffer);
                    neighbourId = new ClientId(provideOffer.from);
                    direction = this.getNeighbourDirection(neighbourId);
                    const remoteConnection: RemoteRTCClient = new RemoteRTCClient(this.logger);
                    remoteConnection.connectionEstablished.subscribe(value => {
                        this.adminConnection?.sendMessage(new ConnectionEstablished(this.id.id, neighbourId.id));
                        remoteConnection.connectionEstablished.unsubscribe();
                    });
                    let gotAnswer: boolean = false;
                    remoteConnection.newIceCandidate.subscribe((answer) => {
                        if (gotAnswer) {
                            return;
                        }
                        this.adminConnection?.sendMessage(new ProvideAnswer(this.id.id, neighbourId.id, JSON.stringify(answer)));
                        gotAnswer = true;
                    });
                    remoteConnection.setOffer(JSON.parse(provideOffer.offer)).then((res) => {
                        remoteConnection.createNewAnswer();
                    });
                    this.addNeighbour(direction, neighbourId, remoteConnection);
                    this.board.addNeighbour(direction, provideOffer.fromName);
                    break;
                case EventType.ProvideAnswer:
                    const provideAnswer: ProvideAnswer = (event as ProvideAnswer);
                    let neighbour = this.neighbours.get(this.getNeighbourDirection(new ClientId(provideAnswer.from)));
                    if (neighbour?.connection) {
                        (neighbour.connection as LocalRTCClient).setAnswer(JSON.parse(provideAnswer.answer));
                    }
                    break;
            }
        });

    }

    getNeighbourDirection(neighbourId: ClientId): Direction {
        const coords = this.id.getCoordinates();
        const neighbourCoords = neighbourId.getCoordinates();

        const coordTransformDif = {
            x: coords.x - 1,
            y: coords.y - 1
        };

        const transformedNeighbourCoords = {
            x: neighbourCoords.x - coordTransformDif.x,
            y: neighbourCoords.y - coordTransformDif.y
        };

        switch (ClientId.fromCoordinates(transformedNeighbourCoords).id) {
            case ClientId.fromCoordinates({x: 0, y: 0}).id:
                return Direction.NorthWest;
            case ClientId.fromCoordinates({x: 1, y: 0}).id:
                return Direction.North;
            case ClientId.fromCoordinates({x: 2, y: 0}).id:
                return Direction.NorthEast;
            case ClientId.fromCoordinates({x: 2, y: 1}).id:
                return Direction.East;
            case ClientId.fromCoordinates({x: 2, y: 2}).id:
                return Direction.SouthEast;
            case ClientId.fromCoordinates({x: 1, y: 2}).id:
                return Direction.South;
            case ClientId.fromCoordinates({x: 0, y: 2}).id:
                return Direction.SouthWest;
            case ClientId.fromCoordinates({x: 0, y: 1}).id:
                return Direction.West;
        }

        this.logger.error(`neighbour ${JSON.stringify(neighbourCoords)} not in direct neighbourhood or on the same coordinate ${JSON.stringify(this.id.getCoordinates())}`);
        return Direction.NoDirection;
    }

    private sendEventToNeighbour(direction: Direction, event: Event) {
        this.neighbours.get(direction)?.connection?.sendMessage(event);
    }

    private getNewPosFromDirectionalPos(direction: Direction, oldPos: Position, part: string): Position {
        this.logger.info(`${part} entered from direction ${Direction[direction]} with coords: ${JSON.stringify(oldPos)}`);
        let newPosition: Position = {
            x: 0,
            y: 0
        };

        switch (direction) {
            case Direction.North:
                newPosition = {
                    x: oldPos.x,
                    y: environment.boardSize - 2
                };
                break;
            case Direction.East:
                newPosition = {
                    x: 1,
                    y: oldPos.y
                };
                break;
            case Direction.South:
                newPosition = {
                    x: oldPos.x,
                    y: 1
                };
                break;
            case Direction.West:
                newPosition = {
                    x: environment.boardSize - 2,
                    y: oldPos.y
                };
                break;
            default:
                this.logger.error('neighbour events should not come from anyone other than N/E/S/W');
                break;
        }

        return newPosition;
    }

    private getNewFoodIndicatorPosition(event: FoodPosUpdate): Position | null {
        if (this.id.id === new ClientId(event.from).id) {
            return null;
        }

        let newPosition: Position = {
            x: 0,
            y: 0
        };

        const neighbourDirection = this.getNeighbourDirection(new ClientId(event.from));

        //No neighbour relation
        if (neighbourDirection === Direction.NoDirection) {
            return null;
        }

        switch (neighbourDirection) {
            case Direction.NorthWest:
                newPosition = {
                    x: 0,
                    y: 0
                };
                break;
            case Direction.North:
                newPosition = {
                    x: event.newPos.x,
                    y: 0
                };
                break;
            case Direction.NorthEast:
                newPosition = {
                    x: environment.boardSize - 1,
                    y: 0
                };
                break;
            case Direction.East:
                newPosition = {
                    x: environment.boardSize - 1,
                    y: event.newPos.y
                };
                break;
            case Direction.SouthEast:
                newPosition = {
                    x: environment.boardSize - 1,
                    y: environment.boardSize - 1
                };
                break;
            case Direction.South:
                newPosition = {
                    x: event.newPos.x,
                    y: environment.boardSize - 1
                };
                break;
            case Direction.SouthWest:
                newPosition = {
                    x: 0,
                    y: environment.boardSize - 1
                };
                break;
            case Direction.West:
                newPosition = {
                    x: 0,
                    y: event.newPos.y
                };
                break;
        }

        return newPosition;
    }

    private getNewHeadIndicatorPosition(event: HeadPosUpdate): Position {
        let newPosition: Position = {
            x: 0,
            y: 0
        };

        switch (event.direction) {
            case Direction.North:
                newPosition = {
                    x: event.newPos.x,
                    y: environment.boardSize - 1
                };
                break;
            case Direction.East:
                newPosition = {
                    x: 0,
                    y: event.newPos.y
                };
                break;
            case Direction.South:
                newPosition = {
                    x: event.newPos.x,
                    y: 0
                };
                break;
            case Direction.West:
                newPosition = {
                    x: environment.boardSize - 1,
                    y: event.newPos.y
                };
                break;
        }

        return newPosition;
    }
}

