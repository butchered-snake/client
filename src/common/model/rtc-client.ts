import {Subject} from 'rxjs';
import {LogService} from '../services/log.service';
import {Event} from './event';

export abstract class RTCClient {

    public connectionEstablished: Subject<void>;
    protected peerConnection: RTCPeerConnection;
    protected dataChannel: RTCDataChannel | undefined;
    private onEvent: (event: Event) => void;

    protected constructor(private baseLogger: LogService) {
        this.connectionEstablished = new Subject<void>();
        this.peerConnection = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
        this.peerConnection.onicecandidateerror = (error: RTCPeerConnectionIceErrorEvent) => this.baseLogger.error('ice connection error', error.errorText);
        this.setUpDataChannel();

        this.onEvent = (event: Event) => {
            this.baseLogger.debug(JSON.stringify(event));
        };
    }

    abstract setUpDataChannel(): void;

    public sendMessage(message: Event): void {
        if (!this.dataChannel) {
            return;
        }

        this.dataChannel.send(JSON.stringify(message));
    }

    setOnEventCallback(fn: (event: Event) => void) {
        this.onEvent = fn;
    }

    protected handleDataChannelMessage(message: MessageEvent): void {
        const json = JSON.parse(message.data);
        this.onEvent(json as Event);
    }

}
