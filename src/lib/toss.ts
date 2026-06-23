/**
 * 토스 미니앱 환경 유틸
 *
 * isTossEnv() 판별 기준: ReactNativeWebView 주입 여부.
 * 토스 WebView는 document 생성 시점에 주입하므로 React useEffect 실행 시 이미 존재함.
 * 단, 토스 외 RN 기반 인앱브라우저에서도 true가 될 수 있는 한계가 있음.
 */
export function isTossEnv(): boolean {
  return typeof window !== 'undefined' && 'ReactNativeWebView' in window
}

/**
 * 위치 권한 거부 여부를 나타내는 표준화된 에러.
 * 토스 SDK(GetCurrentLocationPermissionError)와 웹 표준(code === 1) 양쪽을 통일.
 */
export class LocationPermissionDeniedError extends Error {
  constructor() {
    super('위치 권한이 거부되었습니다.')
    this.name = 'LocationPermissionDeniedError'
  }
}

/**
 * 현재 위치 가져오기 (토스: SDK getCurrentLocation, 웹: navigator.geolocation)
 *
 * 실패 시 LocationPermissionDeniedError 또는 일반 Error를 throw.
 * 두 환경 모두 동일한 에러 타입을 사용하므로 호출 측에서 환경 분기 불필요.
 *
 * dynamic import: 웹 환경에서 SDK 번들 평가를 막기 위함
 * (빌드 산출물에는 별도 청크로 포함되나 웹에서 실제 실행되지 않음)
 */
export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  if (isTossEnv()) {
    const { getCurrentLocation, Accuracy } = await import('@apps-in-toss/web-framework')
    try {
      const result = await getCurrentLocation({ accuracy: Accuracy.Balanced })
      return { lat: result.coords.latitude, lng: result.coords.longitude }
    } catch (err: unknown) {
      // 토스 SDK는 권한 거부 시 GetCurrentLocationPermissionError를 throw
      // error.name으로 판별 (instanceof는 번들 경계 문제로 불안정)
      if (err instanceof Error && err.name === 'getCurrentLocation permission error') {
        throw new LocationPermissionDeniedError()
      }
      throw err
    }
  }

  // 일반 웹 환경
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        if (err.code === 1 /* PERMISSION_DENIED */) {
          reject(new LocationPermissionDeniedError())
        } else {
          reject(err)
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

/**
 * 외부 URL 열기 (토스: SDK openURL → supertoss://web?external=true, 웹: window.open)
 *
 * 실패 시 조용히 처리 — 지도/사진 링크 열기 실패는 치명적이지 않음.
 * 단, console.error로 디버깅 가능하게 기록.
 */
export async function openExternalURL(url: string): Promise<void> {
  try {
    if (isTossEnv()) {
      const { openURL } = await import('@apps-in-toss/web-framework')
      await openURL(url)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    console.error('[toss] openExternalURL failed:', err)
  }
}
