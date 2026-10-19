# 영웅합전서 출시 명칭 점검

## 적용 범위

2026-10-19 확인한 기본 브랜치는 `dfbf3c368b765021a3e175473193724b4e717901` (2026-10-02)입니다. 운영 배포에 이후 변경이 있을 수 있으므로 배포 전 운영 소스와 병합해야 합니다.

시작·로그인 화면, 게임 방법 팝업, 웹 title/application-name/OG/Twitter 제목, Capacitor appName, Android app_name/title_activity_main, README와 패키징 문서의 명칭을 영웅합전서로 통일합니다.

## 로그인 영향

- appId, applicationId, namespace, Java 패키지와 Android custom_url_scheme는 `com.kimsoonil.koreanhistorymergedefense`로 유지합니다.
- 네이티브 OAuth 복귀 주소는 `com.kimsoonil.koreanhistorymergedefense://auth/callback`을 유지합니다.
- Google Cloud의 기존 Supabase `/auth/v1/callback`, 웹의 `window.location.origin`, 기존 배포 도메인과 저장 키를 유지합니다.
- 내부 npm 패키지명과 저장소명은 표시 이름이 아니므로 유지합니다.
- 이 명칭 변경 때문에 OAuth 대시보드 주소를 변경할 필요는 없습니다. 실제 Supabase 허용 주소와 계정 설정은 저장소만으로 확인할 수 없습니다.
- 향후 패키지 변경은 앱 업데이트 식별, 서명 인증서, 공급자 설정, 딥링크를 별도로 검토해야 합니다.

출시 기기에서 Google 로그인 → 외부 브라우저 → 앱 복귀를 앱 실행/종료 상태 각각 확인하고, 계정 저장·재시작·복원과 웹 로그인 복귀도 확인해야 합니다.

## 이미지 조사

이전 작업에서 게임명 노출 가능성이 높은 자산을 육안 확인했습니다. 이전 제목은 이미지에 포함된 글자가 아니라 HTML 텍스트였습니다.

| 자산 | 결과 | 처리 |
| --- | --- | --- |
| `public/cinematics/home-splash.png` | 영웅 3명과 성곽, 이전 게임명 없음 | 유지, HTML 제목 수정 |
| `public/app-icon.png` | 서책·궁궐·무기, 이전 게임명 없음 | 유지 |
| Android `mipmap-*/ic_launcher*.png` | 서책 아이콘 변형, 이전 게임명 없음 | 유지 |
| Android `drawable*/splash.png` 11개 | Capacitor 기본 로고, 이전 게임명 없음 | 출시 전 브랜드 스플래시 교체 권장 |
| Android 기본 런처 벡터 XML | 게임명 문자열 없음 | 추후 참조 확인 후 정리 |
| README 메인 이미지 | 홈 배경 재사용 | alt 수정 |

명칭 변경 때문에 반드시 다시 그려야 하는 이미지는 확인되지 않았습니다. 전투·인물 이미지 전체 OCR이나 저장소 밖 스토어 스크린샷·홍보물·운영 자산 점검은 수행하지 않았습니다.

## 검증

이전 작업에서 동일 기준 커밋으로 수행한 결과:

- npm 설치, TypeScript 검사, Next.js 프로덕션 정적 내보내기, Capacitor Android 동기화 성공.
- 생성 HTML 메타데이터와 Android 생성 설정의 appName/appId 확인 통과.
- 로그인·계정별 저장·클라우드 저장·OAuth 식별자 검사 10개 통과.
- 전체 241개 중 187개 통과, 54개 실패. 수정 전 별도 worktree는 240개 중 186개 통과, 동일한 54개 실패로 추가 실패 없음.
- 기존 arena.css의 start/flex-start 호환성 경고가 남습니다.
- APK 빌드는 Gradle 다운로드 네트워크 제한으로 실패했고 Android SDK도 없어 미완료입니다.
- Chromium 실행 파일과 다운로드 문제로 화면 시각 검증은 미완료입니다.
- 실제 기기 OAuth, 서명 AAB, Play Console와 운영 배포 검증은 남아 있습니다.

작업 공간 정리로 이전 로컬 파일이 제거되어 같은 공개 기준 소스에 승인된 변경을 재적용했습니다. 이번 PR 생성은 기본 브랜치 병합이나 운영 배포를 포함하지 않습니다.
