// thank you a-frame https://github.com/aframevr/aframe/blob/042a3d6b7087a632c5165227b14bc37573375cde/src/utils/device.js

function isOculusBrowser() {
  return /(OculusBrowser)/i.test(window.navigator.userAgent);
}

function isFirefoxReality() {
  return /(Mobile VR)/i.test(window.navigator.userAgent);
}

export function isDesktopReality() {
  const isSupported = "xr" in window.navigator;
  return isSupported;
}

export function isStandaloneVR() {
  return isOculusBrowser() || isFirefoxReality();
}
