import {Injectable} from '@angular/core';
import {BackendSocketService} from './backend-socket.service';
import {LocalRTCClient} from '../model/local-rtc-client';
import {Subject, Subscription} from 'rxjs';
import {SocketEvents} from '../shared/socket-events.enum';
import {AnswerEventData} from '../shared/types';
import {LogService} from './log.service';
import {NbToastrService} from '@nebular/theme';
import {Event} from '../model/event';


@Injectable({
    providedIn: 'root'
})
export class AdminClientConnectionService {

    public createdGame: Subject<string>;
    public peerConnections: Map<string, LocalRTCClient> = new Map<string, LocalRTCClient>();
    public webRTCConnectionCount = 0;
    private pendingConnection: LocalRTCClient;
    private currentICECandidateSubscription: Subscription;
    private gameCreatedSubscription: Subscription;
    private answerSubscription: Subscription;
    private isGameCreated: boolean = false;
    private alreadyGotOffer: boolean = false;

    constructor(private logger: LogService,
                private backendSocketService: BackendSocketService, private toastrService: NbToastrService) {
        this.pendingConnection = new LocalRTCClient(logger, toastrService);
        this.pendingConnection.connectionEstablished.subscribe(this.onConnectionEstablished.bind(this));
        this.currentICECandidateSubscription = this.pendingConnection.newLocalDescription.subscribe(this.newIceCandidate.bind(this));
        this.gameCreatedSubscription = this.backendSocketService.events.get(SocketEvents.GameCreated)!.subscribe(this.gameCreated.bind(this));
        this.answerSubscription = this.backendSocketService.events.get(SocketEvents.Answer)!.subscribe(this.gotAnswer.bind(this));
        this.createdGame = new Subject<string>();
    }

    private _code: string = '';

    get code(): string {
        return this._code;
    }

    set code(value: string) {
        this._code = value;
    }

    private _name: string = '';

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    public requestNewGame(): void {
        this.pendingConnection.createNewOffer();
        this.logger.info('start a new game');
    }

    public sendToClients(event: Event): void {
        this.peerConnections.forEach((value: LocalRTCClient, key: string) => value.sendMessage(event));
    }

    private onConnectionEstablished(): void {
        this.webRTCConnectionCount++;
    }

    private setUpPendingConnection(): void {
        this.pendingConnection.connectionEstablished.subscribe(this.onConnectionEstablished.bind(this));
        this.currentICECandidateSubscription.unsubscribe();
        this.currentICECandidateSubscription = this.pendingConnection.newLocalDescription.subscribe(this.newIceCandidate.bind(this));
    }

    private gotAnswer(args: AnswerEventData): void {
        this.pendingConnection.setAnswer(JSON.parse(args.answer));
        this.peerConnections.set(args.name, this.pendingConnection);
        this.pendingConnection = new LocalRTCClient(this.logger, this.toastrService);
        this.setUpPendingConnection();
        this.isGameCreated = true;
        this.alreadyGotOffer = false;
        this.pendingConnection.createNewOffer();
    }

    private gameCreated(gameId: string): void {
        this.code = gameId;
        this.createdGame.next(gameId);
        this.logger.info(`new game created with id ${this.code}`);
    }

    private newIceCandidate(offer: RTCSessionDescription): void {
        this.logger.debug(`got new ice candidate. alreadyGotOffer is ${this.alreadyGotOffer}. isGameCreated is ${this.isGameCreated}`);
        if (this.alreadyGotOffer) {
            return;
        }

        if (!this.isGameCreated) {
            this.backendSocketService.createGame(JSON.stringify(offer));
        } else {
            this.backendSocketService.sendOffer(this.code, JSON.stringify(offer));
        }
        this.alreadyGotOffer = true;
    }
}
