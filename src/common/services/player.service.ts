import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor() {
  }

  private _code: string = '';

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  private _name: string = '';

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  private _isAdmin: boolean = false;

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  set isAdmin(value: boolean) {
    this._isAdmin = value;
  }
}
