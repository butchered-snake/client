import {Subject} from 'rxjs';
import {LogService} from '../services/log.service';

export abstract class RTCClient {

    public connectionEstablished: Subject<void>;
    protected peerConnection: RTCPeerConnection;
    protected dataChannel: RTCDataChannel | undefined;
    private readonly _newIceCandidate: Subject<RTCSessionDescription>;

    protected constructor(private baseLogger: LogService) {
        this.connectionEstablished = new Subject<void>();
        this._newIceCandidate = new Subject<RTCSessionDescription>();
        this.peerConnection = new RTCPeerConnection();
        this.setUpDataChannel();

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            this.baseLogger.debug('new ice candidate on local connection');
            if (this.peerConnection.localDescription) {
                this._newIceCandidate.next(this.peerConnection.localDescription);
            }
        };
    }

    get newIceCandidate(): Subject<RTCSessionDescription> {
        return this._newIceCandidate;
    }

    abstract setUpDataChannel(): void;

    public sendMessage(message: string): void {
        if (!this.dataChannel) {
            return;
        }

        this.dataChannel.send(message);
    }

    protected handleDataChannelMessage(message: MessageEvent): void {
        this.baseLogger.debug('message received', message);
    }
}
