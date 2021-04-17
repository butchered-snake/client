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

    public async createNewOffer(): Promise<RTCSessionDescriptionInit> {
        const description = await this.peerConnection.createOffer();
        this.logger.debug('created new offer');

        await this.peerConnection.setLocalDescription(description).then(value => this.logger.info('Set local offer description')).catch(reason => this.logger.error(`error while setting local description ${reason}`));

        return new Promise<RTCSessionDescriptionInit>(resolve => resolve(description));
    }

    public async setAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        await this.peerConnection.setRemoteDescription(answer).then(value => this.logger.debug('answer set successfully')).catch(reason => this.logger.error(`error while setting remote answer ${reason}`));

    }

}
