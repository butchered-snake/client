import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {ClientId} from '../model/client-id';
import {LocalRTCClient} from '../model/local-rtc-client';
import {Position} from '../shared/types';
import {BoardService} from './board.service';
import {AdminClientConnectionService} from './admin-client-connection.service';
import {Router} from '@angular/router';
import {RequestOffer} from '../model/event';

@Injectable({
    providedIn: 'root'
})
export class AdminClientService {

    private idToName: Map<number, string> = new Map<number, string>();
    private connections: Map<number, LocalRTCClient> = new Map<number, LocalRTCClient>();
    private pendingConnectionQueue: boolean[];
    private maxX: number = 0;
    private maxY: number = 0;

    constructor(private logger: LogService, private boardService: BoardService,
                private adminClientConnectionService: AdminClientConnectionService, private router: Router) {
        this.pendingConnectionQueue = [];
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

        this.maxX = maxX;
        this.maxY = maxY;
        this.logger.info(`maxX: ${maxX}, maxY: ${maxY}`);

        this.startClientHandshakes();
    }

    private startClientHandshakes(): void {
        const partners = this.createHandshakePartners();
        partners.forEach(partner => {
            this.connections.get(partner.from.id)!.sendMessage(new RequestOffer(partner.from.id, this.idToName.get(partner.from.id)!, partner.from.id));
        });
    }

    private createHandshakePartners(): { from: ClientId, to: ClientId }[] {
        const partners = [];

        const possiblePlayfield: boolean[][] = [];

        for (let i = 0; i <= this.maxY; i++) {
            possiblePlayfield[i] = [];
            for (let j = 0; j <= this.maxX; j++) {
                const id = ClientId.fromCoordinates({x: i, y: j});
                possiblePlayfield[i][j] = this.idToName.has(id.id);
            }
        }

        for (let i = 0; i < possiblePlayfield.length; i++) {
            for (let j = 0; j < possiblePlayfield[i].length - 1; j++) {
                if (possiblePlayfield[i][j] && possiblePlayfield[i][j + 1]) {
                    partners.push({
                        from: ClientId.fromCoordinates({x: j, y: i}),
                        to: ClientId.fromCoordinates({x: j + 1, y: i}),
                    });
                }
            }
        }

        for (let i = 0; i < possiblePlayfield.length - 1; i++) {
            for (let j = 0; j < possiblePlayfield[i].length; j++) {
                if (possiblePlayfield[i][j] && possiblePlayfield[i + 1][j]) {
                    partners.push({
                        from: ClientId.fromCoordinates({x: j, y: i}),
                        to: ClientId.fromCoordinates({x: j, y: i + 1}),
                    });
                }
            }
        }

        console.log(partners);

        return partners;
    }

    private startGame(): void {
        this.router.navigate(['/game'], {}).then(value => this.logger.info('navigated to game'));
    }

    private addConnectionToMap(position: Position, name: string, connection: LocalRTCClient): void {
        const id = ClientId.fromCoordinates(position);
        this.idToName.set(id.id, name);
        this.connections.set(id.id, connection);
        this.logger.info(`Set connection from ${name} at position x: ${position.x}, y: ${position.y}`);
    }
}



