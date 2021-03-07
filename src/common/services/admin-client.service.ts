import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {ClientId} from '../model/client-id';
import {LocalRTCClient} from '../model/local-rtc-client';

@Injectable({
    providedIn: 'root'
})
export class AdminClientService {

    private idToName: Map<ClientId, string> = new Map<ClientId, string>();
    private connections: Map<ClientId, LocalRTCClient> = new Map<ClientId, LocalRTCClient>();

    constructor(private logger: LogService) {
    }

    public addConnections(connections: Map<string, LocalRTCClient>): void {
        const amountOfConnections = connections.size;


    }
}


