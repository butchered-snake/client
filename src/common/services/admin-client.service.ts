import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {ClientId} from '../model/client-id';
import {LocalRTCClient} from '../model/local-rtc-client';
import {Position} from '../shared/types';
import {BoardService} from './board.service';
import {AdminClientConnectionService} from './admin-client-connection.service';

@Injectable({
    providedIn: 'root'
})
export class AdminClientService {

    private idToName: Map<ClientId, string> = new Map<ClientId, string>();
    private connections: Map<ClientId, LocalRTCClient> = new Map<ClientId, LocalRTCClient>();

    constructor(private logger: LogService, private boardService: BoardService, private adminClientConnectionService: AdminClientConnectionService) {
    }

    public addConnections(): void {
        const amountOfConnections = this.adminClientConnectionService.peerConnections.size;
        let maxX = 0;
        let maxY = 0;
        let x = 0;
        let y = 0;
        let step = 0;

        const adminConnection = this.adminClientConnectionService.peerConnections.get(this.adminClientConnectionService.name);

        if (adminConnection === undefined) {
            this.logger.error('We lost our admin client connection. Sadge');
            return;
        }

        this.adminClientConnectionService.peerConnections.delete(this.adminClientConnectionService.name);
        this.addConnectionToMap({
            x: x,
            y: y
        }, this.adminClientConnectionService.name, adminConnection);

        const connectionsArray = Array.from(this.adminClientConnectionService.peerConnections.entries());

        //The pattern repeats itself after 6 steps. Each step can add multiple elements
        while (this.connections.size < amountOfConnections) {
            switch (step % 6) {
                //Go down one step
                case 0:
                    y++;
                    const [name, connection] = connectionsArray.pop()!;
                    this.addConnectionToMap({
                        x: x,
                        y: y
                    }, name, connection);
                    step++;
                    maxY = y;
                    break;
                //Go left until x > maxX
                //Set x as new maxX
                case 1:
                    while (x <= maxX && this.connections.size < amountOfConnections) {
                        x++;
                        const [name, connection] = connectionsArray.pop()!;
                        this.addConnectionToMap({
                            x: x,
                            y: y
                        }, name, connection);
                    }
                    maxX = x;
                    step++;
                    break;
                //Go up until we reach y = 0
                case 2:
                    while (y !== 0 && this.connections.size < amountOfConnections) {
                        y--;
                        const [name, connection] = connectionsArray.pop()!;
                        this.addConnectionToMap({
                            x: x,
                            y: y
                        }, name, connection);
                    }
                    step++;
                    break;
                //Go one to the right
                case 3:
                    x++;
                    const [name2, connection2] = connectionsArray.pop()!;
                    this.addConnectionToMap({
                        x: x,
                        y: y
                    }, name2, connection2);
                    maxX = x;
                    step++;
                    break;
                //Go down until y > maxY
                //Set new Y to maxY
                case 4:
                    while (y <= maxY && this.connections.size < amountOfConnections) {
                        y++;
                        const [name, connection] = connectionsArray.pop()!;
                        this.addConnectionToMap({
                            x: x,
                            y: y
                        }, name, connection);
                    }
                    maxY = y;
                    step++;
                    break;
                //Go left until x = 0
                case 5:
                    while (x !== 0 && this.connections.size < amountOfConnections) {
                        x--;
                        const [name, connection] = connectionsArray.pop()!;
                        this.addConnectionToMap({
                            x: x,
                            y: y
                        }, name, connection);
                    }
                    step++;
                    break;
            }
        }
    }

    private addConnectionToMap(position: Position, name: string, connection: LocalRTCClient): void {
        const id = ClientId.fromCoordinates(position);
        this.idToName.set(id, name);
        this.connections.set(id, connection);
        this.logger.info(`Set connection from ${name} at position x: ${position.x}, y: ${position.y}`);
    }
}



