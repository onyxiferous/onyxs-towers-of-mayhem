import { createColors } from 'picocolors';

const colors = createColors(true);

type DescriptorColor = keyof typeof colors;

function baseLog(descriptorColor: DescriptorColor, descriptor: string, message: string) {
    const color = colors[descriptorColor];
    if (typeof color === 'function') {
        console.log(`${color(`[${descriptor}]:`)} ${message}`);
    } else {
        console.log(`[${descriptor}]: ${message}`);
    }
}

function logInformation(message: string) {
    baseLog('inverse', 'INFORMATION', message);
}
function logWarning(message: string) {
    baseLog('yellow', 'WARNING', message);
}
function logAsync(message: string) {
    baseLog('magenta', 'ASYNC', message);
}
function logFailure(message: string) {
    baseLog('red', 'FAILURE', message);
}
function logSuccess(message: string) {
    baseLog('green', 'SUCCESS', message);
}
function logSection(message: string) {
    baseLog('gray', '+SECTION+', message);
}
function logPromise(message: string) {
    baseLog('cyan', 'PROMISE', message);
}
function logApi(message: string) {
    baseLog('magenta', 'API', message);
}

export {
    logInformation,
    logWarning,
    logAsync,
    logFailure,
    logSuccess,
    logSection,
    logPromise,
    logApi
};