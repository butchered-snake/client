import {RTCClient} from './rtc-client';
import {LogService} from '../services/log.service';
import {NbToastrService} from '@nebular/theme';

export class RemoteRTCClient extends RTCClient {

    constructor(private logger: LogService, private toastrService: NbToastrService) {
        super(logger, toastrService);
    }

    setUpDataChannel(): void {
        this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
            this.dataChannel.onerror = (event: RTCErrorEvent) => this.logger.error('on data channel error', event.error.message);
            this.dataChannel.onopen = (event: Event) => {
                this.logger.debug('data channel opened');
                this.connectionEstablished.next();
            };
        };
    }

    public createNewAnswer(): void {
        this.peerConnection.createAnswer()
            .then((answer: RTCSessionDescriptionInit) => {
                this.peerConnection.setLocalDescription(answer).then(value => this.logger.info('Set local answer description'));
            }).then(event => this.logger.debug('answer created successfully'));
    }

    public setOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        return this.peerConnection.setRemoteDescription(offer).then(value => this.logger.info('Offer set successfully'));
    }


}
