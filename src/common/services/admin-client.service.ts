import {Injectable, NgZone} from '@angular/core';
import {LogService} from './log.service';
import {ClientId} from '../model/client-id';
import {LocalRTCClient} from '../model/local-rtc-client';
import {Position} from '../shared/types';
import {BoardService} from './board.service';
import {AdminClientConnectionService} from './admin-client-connection.service';
import {Router} from '@angular/router';
import {
    Event,
    FoodPosUpdate,
    PlacedFood,
    PlaceSnake,
    ProvideAnswer,
    ProvideOffer,
    RequestOffer,
    SetClientId,
    SetFood,
    StartGame,
    StopGame,
    Tick
} from '../model/event';
import {EventType} from '../shared/event-type.enum';
import {interval, Observable, Subscription} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminClientService {

    private idToName: Map<number, string> = new Map<number, string>();
    private connections: Map<number, LocalRTCClient> = new Map<number, LocalRTCClient>();
    private pendingConnectionQueue: boolean[];
    private maxX: number = 0;
    private maxY: number = 0;
    private pendingConnectionsSubscription: Subscription | undefined;
    private connectionChecker: Observable<number>;
    private tickTimer: Observable<number>;
    private tickSubscription: Subscription | undefined;

    constructor(private logger: LogService, private boardService: BoardService, private ngZone: NgZone,
                private adminClientConnectionService: AdminClientConnectionService, private router: Router) {
        this.pendingConnectionQueue = [];
        this.connectionChecker = interval(1000);
        this.tickTimer = interval(500);
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

        this.sendClientIdEvents();
        this.startClientHandshakes();

        this.pendingConnectionsSubscription = this.connectionChecker.subscribe((value => {
            this.logger.info(`Checking connection queue. ${this.pendingConnectionQueue.length} left`);
            if (this.pendingConnectionQueue.length === 0) {
                this.pendingConnectionsSubscription!.unsubscribe();
                this.startGame();
            }
        }));
    }

    sendEventToClients(event: Event) {
        this.connections.forEach((connection: LocalRTCClient, id: number) => {
            connection.sendMessage(event);
        });
    }

    sendEventToRandomClient(event: Event) {
        let keys = Array.from(this.connections.keys());
        this.connections.get(keys[Math.floor(Math.random() * keys.length)])?.sendMessage(event);
    }

    private sendClientIdEvents(): void {
        this.connections.forEach((connection: LocalRTCClient, id: number) => {
            connection.sendMessage(new SetClientId(id));
        });
    }

    private startClientHandshakes(): void {
        const partners = this.createHandshakePartners();
        partners.forEach(partner => {
            this.connections.get(partner.to.id)!.sendMessage(new RequestOffer(partner.from.id, this.idToName.get(partner.from.id)!, partner.to.id));
            this.pendingConnectionQueue.push(true);
        });
    }

    private createHandshakePartners(): { from: ClientId, to: ClientId }[] {
        const partners = [];

        const possiblePlayfield: boolean[][] = [];

        for (let i = 0; i <= this.maxY; i++) {
            possiblePlayfield[i] = [];
            for (let j = 0; j <= this.maxX; j++) {
                const id = ClientId.fromCoordinates({x: j, y: i});
                possiblePlayfield[i][j] = this.idToName.has(id.id);
            }
        }

        this.logger.info('Possible playfield', possiblePlayfield);

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

        this.logger.info('Created partners', partners);

        return partners;
    }

    private startGame(): void {
        this.router.navigate(['/game'], {}).then(value => this.logger.info('navigated to game'));
        this.sendEventToRandomClient(new PlaceSnake());
        this.sendEventToRandomClient(new SetFood());
        this.sendEventToClients(new StartGame());
        this.tickSubscription = this.tickTimer.subscribe((value) => {
            this.sendEventToClients(new Tick());
        });
    }

    private addConnectionToMap(position: Position, name: string, connection: LocalRTCClient): void {
        const id = ClientId.fromCoordinates(position);
        this.idToName.set(id.id, name);
        connection.setOnEventCallback(this.processEvent.bind(this));
        this.connections.set(id.id, connection);
        this.logger.info(`Set connection from ${name} at position x: ${position.x}, y: ${position.y}`);
    }

    private processEvent(event: Event) {
        this.ngZone.run(() => {
            switch (event.type) {
                case EventType.StopGame:
                    const stopGame: StopGame = (event as StopGame);
                    this.logger.info('game should stop', stopGame.reason);
                    this.tickSubscription?.unsubscribe();
                    this.sendEventToClients(new StopGame(stopGame.reason));
                    break;
                case EventType.PlacedFood:
                    const placedFood: PlacedFood = (event as PlacedFood);
                    this.sendEventToClients(new FoodPosUpdate(placedFood.newPos, placedFood.from));
                    break;
                case EventType.FoodEaten:
                    this.sendEventToClients(event);
                    this.sendEventToRandomClient(new SetFood());
                    break;
                case EventType.ProvideOffer:
                    const provideOffer: ProvideOffer = (event as ProvideOffer);
                    provideOffer.fromName = this.idToName.get(provideOffer.from) ?? '';
                    this.connections.get(provideOffer.to)?.sendMessage(event);
                    break;
                case EventType.ProvideAnswer:
                    const provideAnswer: ProvideAnswer = (event as ProvideAnswer);
                    this.connections.get(provideAnswer.to)?.sendMessage(event);
                    break;
                case EventType.ConnectionEstablished:
                    this.pendingConnectionQueue.pop();
                    break;
            }
        });
    }
}

