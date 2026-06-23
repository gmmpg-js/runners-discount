// 토스 미니앱 환경 여부 판별
// ReactNativeWebView가 주입되어 있으면 토스 앱 내 WebView로 판단
export function isTossEnv(): boolean {
  return typeof window !== 'undefined' && 'ReactNativeWebView' in window
}

// 현재 위치 가져오기 (토스 환경: SDK, 웹: navigator.geolocation)
export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  if (isTossEnv()) {
    // 토스 SDK는 번들에 이미 주입되어 있으므로 동적 import 사용
    const { getCurrentLocation, Accuracy } = await import('@apps-in-toss/web-framework')
    const result = await getCurrentLocation({ accuracy: Accuracy.Balanced })
    return { lat: result.coords.latitude, lng: result.coords.longitude }
  }

  // 일반 웹 환경
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// 외부 URL 열기 (토스 환경: SDK openURL, 웹: window.open)
export async function openExternalURL(url: string): Promise<void> {
  if (isTossEnv()) {
    const { openURL } = await import('@apps-in-toss/web-framework')
    await openURL(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
