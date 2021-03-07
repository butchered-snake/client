import {Subject} from 'rxjs';

export abstract class RTCClient {

    protected peerConnection: RTCPeerConnection;
    protected dataChannel: RTCDataChannel | undefined;
    private readonly _newIceCandidate: Subject<RTCSessionDescription>;

    protected constructor() {
        this._newIceCandidate = new Subject<RTCSessionDescription>();

        this.peerConnection = new RTCPeerConnection();
        this.setUpDataChannel();

        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            console.log('New ice candidate on local connection');
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
        console.log('Message lol. ' + message);
    }
}
