import {RTCClient} from './rtc-client';

export class LocalRTCClient extends RTCClient {

  constructor() {
    super();
  }

  setUpDataChannel(): void {
    this.dataChannel = this.peerConnection.createDataChannel('channel');
    this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
    this.dataChannel.onopen = (event: Event) => console.log('data channel opened');
  }

  public createNewOffer(): void {
    this.peerConnection.createOffer()
      .then((offer: RTCSessionDescriptionInit) => this.peerConnection.setLocalDescription(offer))
      .then(event => console.log('Created new offer'));
  }

  public setAnswer(answer: RTCSessionDescriptionInit): void {
    this.peerConnection.setRemoteDescription(answer).then(event => console.log('Answer set successfully'));
  }

}
