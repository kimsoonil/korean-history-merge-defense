# Android 앱 프로젝트

웹 게임을 Capacitor 8 Android 프로젝트로 포장한 초기 구성입니다. `android/`는 네이티브 프로젝트이고, `npm run android:sync`가 Next.js 정적 빌드(`out/`)를 앱 자산으로 복사합니다.

## 현재 범위

- 임시 앱 ID: `com.kimsoonil.koreanhistorymergedefense`. Play Console에 앱을 만들기 전에 소유자와 사용 가능 여부를 확인하고 확정해야 합니다.
- 앱 이름: `한국사 조합 디펜스`
- Android `compileSdkVersion`/`targetSdkVersion`: 36 (Capacitor 8 기본값)
- Android Studio와 SDK가 설치되지 않은 현재 개발 환경에서는 APK/AAB 컴파일이나 실기기 검증은 아직 하지 못했습니다.
- Google OAuth Android 복귀와 계정별 Supabase 저장 코드가 준비되었습니다. 아래 대시보드 설정과 실기기 검증을 마치기 전에는 출시용으로 사용하지 마세요.
- 출시 아이콘과 스플래시 이미지는 아직 Capacitor 기본 자산입니다.

## 개발 및 검증

1. Node.js 22 이상과 Android Studio/SDK(API 36)를 설치합니다.
2. `npm ci`
3. `npm run android:sync`
4. `npm run android:open`으로 Android Studio에서 `android/`를 엽니다.
5. 에뮬레이터 또는 실기기에서 로그인 복귀, 저장·이어하기, 뒤로가기, 화면 비율, 음원·이미지를 검사합니다.

현재 `out/`은 약 381MB입니다. 스토어 제출 전 이미지·음원 용량과 앱 번들 다운로드 크기를 점검해야 합니다. Android 서명키(`*.jks`, `*.keystore`)와 `google-services.json`은 저장소에서 제외합니다.

## 로그인·저장 설정

1. Supabase SQL Editor에서 `supabase/migrations/20261002000000_game_saves.sql`을 실행합니다. 사용자 본인의 행만 읽고 쓸 수 있도록 RLS 정책을 포함합니다.
2. Supabase Authentication → URL Configuration의 Redirect URLs에 `com.kimsoonil.koreanhistorymergedefense://auth/callback`을 추가합니다. Google Cloud OAuth 승인된 리다이렉션 URI는 기존 Supabase `/auth/v1/callback`을 그대로 사용합니다.
3. Android 실기기에서 Google 로그인 → 앱 복귀 → 전투 저장 → 앱 재시작 → 동일 계정의 다른 기기 로그인 순서로 검사합니다.

로그인 계정별 서버 저장은 로컬 계정 기록을 첫 동기화 시 업로드합니다. 게스트 기록은 Google 계정으로 자동 이전하지 않습니다. 기존 서버 기록과 충돌하는 로컬 기록은 `:local-backup:` 키로 기기에 보존합니다. 서버 연결 실패 시 로컬 플레이는 가능하나 동기화 경고가 표시됩니다. 동일 계정을 여러 기기에서 동시에 플레이하면 마지막 저장이 앞선 저장을 덮을 수 있으므로 동시 플레이는 피해야 합니다.

## 다음 작업

1. 확정된 패키지명과 출시용 아이콘·스플래시 적용
2. Google OAuth 복귀·계정별 서버 저장 실기기 검증 및 계정 삭제 기능
4. 광고 SDK·보상 검증과 개인정보 동의
5. 서명된 AAB 생성, Play Console 내부/비공개 테스트
