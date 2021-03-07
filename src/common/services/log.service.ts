import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class LogService {
    constructor() { }

    debug(msg: string, ...optionalParams: any[]) {
        console.info(buildEntry(LogLevel.Debug, msg, ...optionalParams));
    }

    info(msg: string, ...optionalParams: any[]) {
        console.info(buildEntry(LogLevel.Info, msg, ...optionalParams));
    }

    warn(msg: string, ...optionalParams: any[]) {
        console.info(buildEntry(LogLevel.Warn, msg, ...optionalParams));
    }

    error(msg: string, ...optionalParams: any[]) {
        console.info(buildEntry(LogLevel.Error, msg, ...optionalParams));
    }
}

const LogLevel = {
    Debug: "debug",
    Info:  "info",
    Warn:  "warn",
    Error: "error"
}

function buildEntry(logLevel: string, msg: string, ...optionalParams: any[]): string {
    let res: string = "";
    res += logLevel + ': ';
    res += msg;
    if (optionalParams.length > 0) {
        res += ' | args: ' + JSON.stringify(optionalParams);
    }
    return res;
}

