import {Injectable, OnDestroy} from '@angular/core';
import {environment} from '../../environments/environment';
import {io, Socket} from 'socket.io-client';
import {SocketEvents} from '../shared/socket-events.enum';
import {Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BackendSocketService implements OnDestroy {

  public events: Map<SocketEvents, Subject<any>> = new Map<SocketEvents, Subject<any>>();
  private socket: Socket;

  constructor() {
    this.setUpSubjects();
    this.socket = io(environment.backendUrl);

    this.socket.on('connect', () => {
      console.log(this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log(this.socket.id);
    });

    this.socket.on('gameCreated', (gameId: string) => {
      this.events.get(SocketEvents.GameCreated)?.next(gameId);
    });

    this.socket.on('offer', (offer: string) => {
      this.events.get(SocketEvents.Offer)?.next(offer);
    });

    this.socket.on('answer', (name: string, answer: string) => {
      this.events.get(SocketEvents.Answer)?.next({
        name: name,
        answer: answer
      });
    });
  }

  public createGame(offer: string): void {
    this.socket.emit('create', offer);
  }

  public sendOffer(gameId: string, offer: string): void {
    this.socket.emit('offer', gameId, offer);
  }

  public sendAnswer(gameId: string, name: string, offer: string): void {
    this.socket.emit('answer', gameId, name, offer);
  }

  public joinGame(gameId: string): void {
    this.socket.emit('join', gameId);
  }

  ngOnDestroy(): void {
    this.socket.close();
  }

  private setUpSubjects() {
    const events = this.getEventsFromEnum();
    events.forEach(event => this.events.set(event, new Subject<object>()));
  }

  private getEventsFromEnum(): number[] {
    return Object.values(SocketEvents).filter(value => !isNaN(Number(value))).map(value => Number(value));
  }

}
