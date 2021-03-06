import {Injectable, OnDestroy} from '@angular/core';
import {environment} from '../../environments/environment';
import {io, Socket} from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class BackendSocketService implements OnDestroy {

  private socket: Socket;

  constructor() {
    this.socket = io(environment.backendUrl);

    this.socket.on('connect', () => {
      console.log(this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log(this.socket.id);
    });
  }

  public requestNewGame(): void {
    this.socket.emit('create');
  }

  public sendOffer(offer: string): void {
    this.socket.emit('sendOffer', offer);
  }

  ngOnDestroy(): void {
    this.socket.close();
  }

}
