import {Injectable} from '@angular/core';
import {BackendSocketService} from './backend-socket.service';
import {Subscription} from 'rxjs';
import {SocketEvents} from '../shared/socket-events.enum';
import {RemoteRTCClient} from '../model/remote-rtc-client';
import {LogService} from './log.service';
import {ClientService} from './client.service';

@Injectable({
    providedIn: 'root'
})
export class ClientConnectionService {

    public peerConnection: RemoteRTCClient;
    private offerSubscription: Subscription;

    constructor(private logger: LogService, private backendSocketService: BackendSocketService, private clientService: ClientService) {
        this.peerConnection = new RemoteRTCClient(logger);
        this.offerSubscription = this.backendSocketService.events.get(SocketEvents.Offer)!.subscribe(this.gotOffer.bind(this));

        this.peerConnection.connectionEstablished.subscribe(value => {
            this.clientService.initializeService(this.peerConnection, this.name);
        });
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
        this.backendSocketService.joinGame(this.code);
    }

    private gotOffer(offer: string): void {
        this.peerConnection.setOffer(JSON.parse(offer)).then(event => {
            this.peerConnection.createNewAnswer().then(value => {
                this.backendSocketService.sendAnswer(this.code, this.name, JSON.stringify(value));
            });
        });
    }
}
