const picocolors = require('picocolors')
picocolors.createColors({ enabled: true })

function baseLog(descriptorColor, descriptor, message) {
  const color = picocolors[descriptorColor];
  if (!color) {
    return
  }
  console.log(`${color(`[${descriptor}]:`)} ${message}`)
}

function logInformation(message) {
  baseLog('inverse', 'INFORMATION', message)
}

function logWarning(message) {
  baseLog('yellow', 'WARNING', message)
}

function logAsync(message) {
  baseLog('magenta', 'ASYNC', message)
}

function logFailure(message) {
  baseLog('red', 'FAILURE', message)
}

function logSuccess(message) {
  baseLog('green', 'SUCCESS', message)
}

function logSection(message) {
  baseLog('gray', '+SECTION+', message)
}

function logPromise(message) {
  baseLog('cyan', 'PROMISE', message)
}

module.exports = {
  logInformation,
  logWarning,
  logAsync,
  logFailure,
  logSuccess,
  logSection,
  logPromise
}