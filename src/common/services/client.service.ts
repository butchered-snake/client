import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {Event, HeadPosUpdate, ProvideAnswer, ProvideOffer, RequestOffer, SetClientId} from '../model/event';
import {EventType} from '../shared/event-type.enum';
import {ClientId} from '../model/client-id';
import {Neighbour} from '../model/neighbour';
import {Direction} from '../shared/direction.enum';
import {BoardService} from './board.service';
import {RTCClient} from '../model/rtc-client';
import {LocalRTCClient} from '../model/local-rtc-client';
import {RemoteRTCClient} from '../model/remote-rtc-client';

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
                this.board.headIndicator = (event as HeadPosUpdate).newPos;
        }
    }

    processBoardEvent(event: Event) {

    }

    processAdminEvent(event: Event) {
        this.logger.debug('received admin event', event);
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
                localConnection.createNewOffer(((offer: RTCSessionDescriptionInit) => {
                    this.adminConnection?.sendMessage(Event.New(EventType.ProvideOffer, this.id.id, '', neighbourId.id, JSON.stringify(offer)));
                    this.addNeighbour(direction, neighbourId, localConnection);
                    this.board.addNeighbour(direction, requestOffer.fromName);
                }).bind(this));
                break;
            case EventType.ProvideOffer:
                const provideOffer: ProvideOffer = (event as ProvideOffer);
                neighbourId = new ClientId(provideOffer.from);
                direction = this.getNeighbourDirection(neighbourId);
                const remoteConnection: RemoteRTCClient = new RemoteRTCClient(this.logger);
                remoteConnection.connectionEstablished.subscribe(value => {
                    this.adminConnection?.sendMessage(Event.New(EventType.ConnectionEstablished));
                    remoteConnection.connectionEstablished.unsubscribe();
                });
                remoteConnection.setOffer(JSON.parse(provideOffer.offer));
                remoteConnection.createNewAnswer(((answer: RTCSessionDescriptionInit) => {
                    this.adminConnection?.sendMessage(Event.New(EventType.ProvideAnswer, this.id.id, neighbourId.id, JSON.stringify(answer)));
                    this.addNeighbour(direction, neighbourId, remoteConnection);
                    this.board.addNeighbour(direction, provideOffer.fromName);
                }).bind(this));
                break;
            case EventType.ProvideAnswer:
                const provideAnswer: ProvideAnswer = (event as ProvideAnswer);
                let neighbour = this.neighbours.get(provideAnswer.from);
                (neighbour?.connection as LocalRTCClient).setAnswer(JSON.parse(provideAnswer.answer));
                break;
        }
    }

    getNeighbourDirection(neighbourId: ClientId): Direction {
        const coords = this.id.getCoordinates();
        const neighbourCoords = neighbourId.getCoordinates();
        if (coords.x < neighbourCoords.x) {
            return Direction.East;
        } else if (coords.x > neighbourCoords.x) {
            return Direction.West;
        }
        if (coords.y < neighbourCoords.y) {
            return Direction.South;
        } else if (coords.y > neighbourCoords.y) {
            return Direction.North;
        }
        this.logger.error('neighbour should not have same pos as client');
        return Direction.NorthEast;
    }
}

