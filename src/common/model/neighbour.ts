import {LogService} from '../services/log.service';
import {Event} from '../model/event';
import {ClientId} from './client-id';
import {RTCClient} from './rtc-client';

export class Neighbour {
    constructor(private logger: LogService, private id: ClientId, private _connection: RTCClient, private onEventCallback: (event: Event) => void) {
        this._connection.setOnEventCallback(onEventCallback);
    }

    get clientId(): ClientId {
        return this.id;
    }

    get connection(): RTCClient {
        return this._connection;
    }
}

