# 이음

### Prerequisite
  - git
  - node.js, npm

### Local Setup
- Repository 다운 받기
  - `git clone https://github.com/Tech-for-Impact-Ieum/Ieum.git`

- 필요한 패키지 다운 받기
  - 다운 받은 Repository를 current dir로 두고 `cd Ieum`
  - 사용된 package 다운로드 `npm install`

- 실행하기
  - root에 .env 파일 만들어서 디스코드에 올라온 환경 변수 세팅하기
    ```
    NEXT_PUBLIC_API_URL=
    NEXT_PUBLIC_SOCKET_URL=
    NEXT_PUBLIC_SOCKET_PORT=
    ```
  - 터미널에서 `npm run dev`
  - 브라우저의 [http://localhost:3000](http://localhost:3000)에서 띄운 웹 확인


### References

- [Git 브랜치 전략](https://junjunrecord.tistory.com/131)
- [Git 커밋 컨벤션](https://kdjun97.github.io/git-github/commit-convention/)
