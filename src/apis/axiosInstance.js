import axios from "axios";

// API 기본 인스턴스 (team2 서비스 경로)
export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 리프레시 전용 인스턴스 (인증 서비스 경로)
const authInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_AUTH_URL,
});

// -- 토큰 재발급 로직을 위한 변수들 --
let isRefreshing = false;
let failedQueue = [];

// 실패 큐 처리 헬퍼
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// 로컬스토리지에 토큰 저장 헬퍼
const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
};

// -- 요청 interceptor: 매 요청마다 최신 토큰 헤더 설정 --
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -- 응답 interceptor: 401 감지 시 refresh 로직 --
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    const originalRequest = config;

    if (response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체에서 401 나면 무한 루프 방지
      if (originalRequest.url.includes("/auth/user/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 리프레시 중이라면 큐에 보관
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;
      // 리프레시 호출은 authInstance로, baseURL 무시
      return new Promise((resolve, reject) => {
        authInstance
          .post("/auth/user/refresh")
          .then(({ data }) => {
            // 새로운 AT를 받아서 저장
            const newToken = data.accessToken;
            setAccessToken(newToken);
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            // 원래 요청에 새 토큰 붙여서 재시도
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);

            // 403(토큰탈취시) AT를 지우고 새로고침 -> 로그인 페이지로로
            if (err.response?.status === 403) {
              localStorage.removeItem("accessToken");
              delete axiosInstance.defaults.headers.common.Authorization;

              alert("사용자 정보 갱신에 실패했습니다. 다시 로그인해 주세요.");
              window.location.reload();
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);

// -- 초기 로딩: 기존 토큰이 있으면 헤더에 세팅 --
const initToken = localStorage.getItem("accessToken");
if (initToken) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${initToken}`;
}