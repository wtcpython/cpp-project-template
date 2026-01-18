import { window, OutputChannel } from "vscode";

let _channel: OutputChannel;

export function getOutputChannel(): OutputChannel {
    if (!_channel) {
        _channel = window.createOutputChannel("C++ Project Template");
    }
    return _channel;
}

export function log(message: string): void {
    getOutputChannel().appendLine(message);
}

export function show(): void {
    getOutputChannel().show();
}
