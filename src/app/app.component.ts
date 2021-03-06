import {Component} from '@angular/core';
import {LocalRTCClient} from '../common/model/local-rtc-client';
import {RemoteRTCClient} from '../common/model/remote-rtc-client';
import {BackendSocketService} from '../common/services/backend-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'butchered-client';
  public lc: LocalRTCClient;
  public rc: RemoteRTCClient;
  public offer: string = '';
  public answer: string = '';
  offerModel: any;
  answerModel: any;

  constructor(public readonly backendSocketService: BackendSocketService) {
    this.lc = new LocalRTCClient();
    this.rc = new RemoteRTCClient();

    this.lc.newIceCandidate.subscribe(value => this.offer = JSON.stringify(value));
    this.rc.newIceCandidate.subscribe(value => this.answer = JSON.stringify(value));
  }

  public setOffer(): void {
    this.rc.setOffer(JSON.parse(this.offerModel));
  }

  public setAnswer(): void {
    this.lc.setAnswer(JSON.parse(this.answerModel));
  }
}
