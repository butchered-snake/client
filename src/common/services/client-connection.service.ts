import {Injectable} from '@angular/core';
import {BackendSocketService} from './backend-socket.service';
import {Subscription} from 'rxjs';
import {SocketEvents} from '../shared/socket-events.enum';
import {RemoteRTCClient} from '../model/remote-rtc-client';
import {LogService} from './log.service';

@Injectable({
    providedIn: 'root'
})
export class ClientConnectionService {

    private currentICECandidateSubscription: Subscription;
    private peerConnection: RemoteRTCClient;
    private offerSubscription: Subscription;
    private createdAnswer = false;

    constructor(private logger: LogService,
                private backendSocketService: BackendSocketService) {
        this.peerConnection = new RemoteRTCClient(logger);
        this.offerSubscription = this.backendSocketService.events.get(SocketEvents.Offer)!.subscribe(this.gotOffer.bind(this));
        this.currentICECandidateSubscription = this.peerConnection.newIceCandidate.subscribe(this.newIceCandidate.bind(this));
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

    public joinGame(): void {
        this.backendSocketService.joinGame(this.code);
    }

    private newIceCandidate(answer: RTCSessionDescription): void {
        if (this.createdAnswer) {
            return;
        }

        this.backendSocketService.sendAnswer(this.code, this.name, JSON.stringify(answer));
        this.createdAnswer = true;
    }

    private gotOffer(offer: string): void {
        this.peerConnection.setOffer(JSON.parse(offer)).then(event => {
            this.logger.debug('offer set successfully');
            this.peerConnection.createNewAnswer();
        });
    }
}
