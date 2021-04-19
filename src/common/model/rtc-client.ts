import {Subject} from 'rxjs';
import {LogService} from '../services/log.service';
import {Event} from './event';
import {NbToastrService} from '@nebular/theme';

export abstract class RTCClient {

    public connectionEstablished: Subject<void>;
    protected peerConnection: RTCPeerConnection;
    protected dataChannel: RTCDataChannel | undefined;
    private readonly _newLocalDescription: Subject<RTCSessionDescription>;
    private onEvent: (event: Event) => void;

    protected constructor(private baseLogger: LogService, private toastService: NbToastrService) {
        this.connectionEstablished = new Subject<void>();
        this._newLocalDescription = new Subject<RTCSessionDescription>();
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.onicecandidateerror = (error: RTCPeerConnectionIceErrorEvent) => this.baseLogger.error('ice connection error', error.errorText);
        this.setUpDataChannel();

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            this.baseLogger.debug('new ice candidate');
            if (this.peerConnection.localDescription) {
                this._newLocalDescription.next(this.peerConnection.localDescription);
            }
        };
        this.onEvent = (event: Event) => {
            this.baseLogger.debug(JSON.stringify(event));
        };
    }

    get newLocalDescription(): Subject<RTCSessionDescription> {
        return this._newLocalDescription;
    }

    abstract setUpDataChannel(): void;

    public sendMessage(message: Event): void {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            this.toastService.danger(`Data channel is not set correctly. You should probably restart the game`, 'error');
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
