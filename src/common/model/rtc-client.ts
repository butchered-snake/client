import {Subject} from 'rxjs';
import {LogService} from '../services/log.service';
import {Event} from './event';

export abstract class RTCClient {

    public connectionEstablished: Subject<void>;
    protected peerConnection: RTCPeerConnection;
    protected dataChannel: RTCDataChannel | undefined;
    private readonly _newIceCandidate: Subject<RTCSessionDescription>;
    private onEvent: (event: Event) => void;

    protected constructor(private baseLogger: LogService) {
        this.connectionEstablished = new Subject<void>();
        this._newIceCandidate = new Subject<RTCSessionDescription>();
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.onicecandidateerror = (error: RTCPeerConnectionIceErrorEvent) => this.baseLogger.error('ice connection error', error.errorText);
        this.setUpDataChannel();

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            this.baseLogger.debug('new ice candidate on local connection');
            if (this.peerConnection.localDescription) {
                this._newIceCandidate.next(this.peerConnection.localDescription);
            }
        };
        this.onEvent = (event: Event) => {
            this.baseLogger.debug(JSON.stringify(event));
        };
    }

    get newIceCandidate(): Subject<RTCSessionDescription> {
        return this._newIceCandidate;
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
