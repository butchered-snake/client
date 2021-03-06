import {RTCClient} from './rtc-client';

export class RemoteRTCClient extends RTCClient {


  constructor() {
    super();
  }

  setUpDataChannel(): void {
    this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
      this.dataChannel = event.channel;
      this.dataChannel.onmessage = this.handleDataChannelMessage.bind(this);
      this.dataChannel.onopen = (event: Event) => console.log('data channel opened');
    };
  }

  public createNewAnswer(): void {
    this.peerConnection.createAnswer()
      .then((answer: RTCSessionDescriptionInit) => this.peerConnection.setLocalDescription(answer))
      .then(event => console.log('Answer created successfully'));
  }

  public setOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    return this.peerConnection.setRemoteDescription(offer);
  }


}
