import {RTCClient} from './rtc-client';
import {LogService} from '../services/log.service';

export class RemoteRTCClient extends RTCClient {


    constructor(private logger: LogService) {
        super(logger);
    }

    setUpDataChannel(): void {
        this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
            this.dataChannel.onopen = (event: Event) => this.logger.debug('data channel opened');
        };
    }

    public createNewAnswer(): void {
        this.peerConnection.createAnswer()
            .then((answer: RTCSessionDescriptionInit) => this.peerConnection.setLocalDescription(answer))
            .then(event => this.logger.debug('answer created successfully'));
    }

    public setOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        return this.peerConnection.setRemoteDescription(offer);
    }


}
