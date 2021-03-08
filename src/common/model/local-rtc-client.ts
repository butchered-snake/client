import {RTCClient} from './rtc-client';
import {LogService} from '../services/log.service';

export class LocalRTCClient extends RTCClient {

    constructor(private logger: LogService) {
        super(logger);
    }

    setUpDataChannel(): void {
        this.dataChannel = this.peerConnection.createDataChannel('channel');
        this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
        this.dataChannel.onerror = (event: RTCErrorEvent) => this.logger.error('on data channel error', event.error.message);
        this.dataChannel.onopen = (event: Event) => {
            this.connectionEstablished.next();
            this.logger.debug('data channel opened');
        };
    }

    public createNewOffer(offerCallback: (offer: RTCSessionDescriptionInit) => void = (o: RTCSessionDescriptionInit) => {
    }): void {
        this.peerConnection.createOffer()
            .then((offer: RTCSessionDescriptionInit) => {
                this.peerConnection.setLocalDescription(offer);
                offerCallback(offer);
            }).then(event => this.logger.debug('created new offer'));
    }

    public setAnswer(answer: RTCSessionDescriptionInit): void {
        this.peerConnection.setRemoteDescription(answer).then(event => this.logger.debug('answer set successfully'));
    }

}
