import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {
    ConnectionEstablished,
    Event,
    FoodPosUpdate,
    HeadPosUpdate,
    ProvideAnswer,
    ProvideOffer,
    RequestOffer,
    SetClientId
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

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    public name: string = '';
    private id: ClientId;
    private neighbours: Map<Direction, Neighbour>;
    private adminConnection: RemoteRTCClient | null = null;

    constructor(private logger: LogService, private board: BoardService) {
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
            case EventType.FoodPosUpdate:
                if (this.board.food) {
                    break;
                }
                this.board.foodIndicator = this.getNewFoodIndicatorPosition(event as FoodPosUpdate);
                break;
        }
    }

    processBoardEvent(event: Event) {

    }

    processAdminEvent(event: Event) {
        let neighbourId: ClientId;
        let direction: Direction;

        switch (event.type) {
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

