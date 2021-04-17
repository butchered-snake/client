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
            this.dataChannel.onerror = (event: RTCErrorEvent) => this.logger.error('on data channel error', event.error.message);
            this.dataChannel.onopen = (event: Event) => {
                this.logger.debug('data channel opened');
                this.connectionEstablished.next();
            };
        };
    }

    public async createNewAnswer(): Promise<RTCSessionDescriptionInit> {
        const description = await this.peerConnection.createAnswer();
        this.logger.debug('created new answer');

        await this.peerConnection.setLocalDescription(description).then(value => this.logger.info('Set local answer description')).catch(reason => this.logger.error(`error while setting local description ${reason}`));

        return new Promise<RTCSessionDescriptionInit>(resolve => resolve(description));
    }

    public async setOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        await this.peerConnection.setRemoteDescription(offer).then(value => this.logger.debug('offer set successfully')).catch(reason => this.logger.error(`error while setting remote offer ${reason}`));

    }


}
