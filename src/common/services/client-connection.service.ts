import {Injectable} from '@angular/core';
import {BackendSocketService} from './backend-socket.service';
import {Subscription, timer} from 'rxjs';
import {SocketEvents} from '../shared/socket-events.enum';
import {RemoteRTCClient} from '../model/remote-rtc-client';
import {LogService} from './log.service';
import {ClientService} from './client.service';
import {NbToastrService} from '@nebular/theme';

@Injectable({
    providedIn: 'root'
})
export class ClientConnectionService {

    public peerConnection: RemoteRTCClient | undefined;
    private currentICECandidateSubscription: Subscription | undefined;
    private offerSubscription: Subscription;
    private connectionEstablishedSubscription: Subscription | undefined;
    private retrySubscription: Subscription | undefined;

    private createdAnswer = false;

    constructor(private logger: LogService, private backendSocketService: BackendSocketService, private clientService: ClientService, private toastrService: NbToastrService) {
        this.offerSubscription = this.backendSocketService.events.get(SocketEvents.Offer)!.subscribe(this.gotOffer.bind(this));
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
        this.logger.info(`Joining game with code ${this.code}`);

        this.retrySubscription = timer(0, 2000).subscribe(value => {
            this.logger.warn(`No data channel on local peer. Retrying`);
            if (this.connectionEstablishedSubscription) {
                this.connectionEstablishedSubscription.unsubscribe();
            }
            if (this.currentICECandidateSubscription) {
                this.currentICECandidateSubscription.unsubscribe();
            }

            this.peerConnection = new RemoteRTCClient(this.logger, this.toastrService);
            this.currentICECandidateSubscription = this.peerConnection.newLocalDescription.subscribe(this.newIceCandidate.bind(this));
            this.connectionEstablishedSubscription = this.peerConnection.connectionEstablished.subscribe(this.onConnectionEstablished.bind(this));

            this.backendSocketService.joinGame(this.code);
            this.createdAnswer = false;
        });
    }

    private onConnectionEstablished(): void {
        if (this.retrySubscription) {
            this.logger.info('Got data channel. Unsubscribing');
            this.retrySubscription.unsubscribe();
        }

        this.clientService.initializeService(this.peerConnection!, this.name);
    }

    private newIceCandidate(answer: RTCSessionDescription): void {
        if (this.createdAnswer) {
            return;
        }

        this.backendSocketService.sendAnswer(this.code, this.name, JSON.stringify(answer));
        this.createdAnswer = true;
    }

    private gotOffer(offer: string): void {
        this.peerConnection!.setOffer(JSON.parse(offer)).then(event => {
            this.logger.debug('offer set successfully');
            this.peerConnection!.createNewAnswer();
        });
    }
}
