import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {
    ConnectionEstablished,
    Event,
    FoodPosUpdate,
    SetFood,
    PlacedFood,
    HeadPosUpdate,
    HeadEntering,
    ProvideAnswer,
    ProvideOffer,
    RequestOffer,
    SetClientId,
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

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    public name: string = '';
    public gameStarted: Subject<void>;
    private id: ClientId;
    private neighbours: Map<Direction, Neighbour>;
    private adminConnection: RemoteRTCClient | null = null;

    constructor(private logger: LogService, private board: BoardService) {
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
        switch (event.type) {
            case EventType.HeadPosUpdate:
                this.board.headIndicator = this.getNewHeadIndicatorPosition(event as HeadPosUpdate);
                break;
            case EventType.HeadEntering:
                const headEntering: HeadEntering = (event as HeadEntering);
                this.board.head = this.getNewPosFromDirectionalPos(headEntering.direction, headEntering.oldPos);
                this.board.headDirection = headEntering.direction;
                break;
            case EventType.TailEntering:
                const tailEntering: TailEntering = (event as TailEntering);
                this.board.tail = this.getNewPosFromDirectionalPos(tailEntering.direction, tailEntering.oldPos);
                break;

        }
    }

    processBoardEvent(event: Event) {
        switch (event.type) {
            case EventType.FoodEaten:
                this.adminConnection!.sendMessage(event);
                break;
            case EventType.HeadEntering:
                const headEntering: HeadEntering = (event as HeadEntering);
                this.sendEventToNeighbour(headEntering.direction, headEntering);
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
                this.sendEventToNeighbour(headPosUpdate.direction, headPosUpdate);
                break;
            case EventType.StopGame:
                this.adminConnection!.sendMessage(event);
                break;
        }

    }

    processAdminEvent(event: Event) {
        let neighbourId: ClientId;
        let direction: Direction;

        switch (event.type) {
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

        this.logger.error('neighbour should not have same pos as client');
        return 25;
    }

    private sendEventToNeighbour(direction: Direction, event: Event) {
        this.neighbours.get(direction)?.connection?.sendMessage(event);
    }

    private getNewPosFromDirectionalPos(direction: Direction, oldPos: Position): Position {
        this.logger.info(`head entered from direction ${Direction[direction]} with coords: ${JSON.stringify(oldPos)}`);
        let newPosition: Position = {
            x: 0,
            y: 0
        };

        switch (direction) {
            case Direction.North:
                newPosition = {
                    x: oldPos.x,
                    y: environment.boardSize - 1
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
                    x: environment.boardSize - 1,
                    y: oldPos.y
                };
                break;
            default:
                this.logger.error('neighbour events should not come from anyone other than N/E/S/W');
                break;
        }

        return newPosition;
    }

    private getNewFoodIndicatorPosition(event: FoodPosUpdate): Position {
        let newPosition: Position = {
            x: 0,
            y: 0
        };

        const neighbourDirection = this.getNeighbourDirection(new ClientId(event.from));

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
                    x: environment.boardSize,
                    y: 0
                };
                break;
            case Direction.East:
                newPosition = {
                    x: environment.boardSize,
                    y: event.newPos.y
                };
                break;
            case Direction.SouthEast:
                newPosition = {
                    x: environment.boardSize,
                    y: environment.boardSize
                };
                break;
            case Direction.South:
                newPosition = {
                    x: event.newPos.x,
                    y: environment.boardSize
                };
                break;
            case Direction.SouthWest:
                newPosition = {
                    x: 0,
                    y: environment.boardSize
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
                    y: environment.boardSize
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
                    x: environment.boardSize,
                    y: event.newPos.y
                };
                break;
        }

        return newPosition;
    }
}

