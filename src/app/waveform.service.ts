import { Injectable } from '@angular/core';
import * as WaveSurfer from 'wavesurfer.js';
import { EventEmitter } from 'events';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WaveformService {
  private _wavesurfer: any;
  private timeChanged: EventEmitter = new EventEmitter();
  private paused: EventEmitter = new EventEmitter();
  private play: EventEmitter = new EventEmitter();
  private readyObservable: BehaviorSubject<boolean>;
  private finishedObs: Subject<boolean>;
  private seekObservable = new Subject();

  constructor() {
    this.readyObservable = new BehaviorSubject(false);
    this.finishedObs = new Subject();
  }

  get wavesurfer() {
    return this._wavesurfer;
  }

  set wavesurfer(ws) {
    this._wavesurfer = ws;
    this._wavesurfer.load('assets/black-parade.wav');

    this._wavesurfer.on('ready', () => {
      this.readyObservable.next(true);
      console.log('wavesurfer ready');
    });

    this._wavesurfer.on('seek', (progress) => {
      this.seekObservable.next(progress * this._wavesurfer.getDuration());
    });

    this._wavesurfer.on('play', () => {
      this.play.emit(null);
    });

    this._wavesurfer.on('pause', () => {
      this.paused.emit(null);
    });

    this._wavesurfer.on('finish', () => {
      this.finishedObs.next(true);
    });
  }

  loadSong(filepath) {
      this._wavesurfer.load(filepath);
      console.log(filepath);
  }

  getReadyObservable() {
    return this.readyObservable;
  }

  getFinishObservable() {
    return this.finishedObs;
  }

  getSeekObservable() {
    return this.seekObservable;
  }

  onNewTime() {
    return Observable.create(observer => {
      this._wavesurfer.on('audioprocess', (msg) => {
        observer.next(Math.floor(msg * 4) / 4);
      });
    });
  }

}
