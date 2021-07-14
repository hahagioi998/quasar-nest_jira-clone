import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const http: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8081/',
});

http.interceptors.response.use(
  (response) => {
    console.log('RESPONSE DATA -', response?.data);
    return response;
  },
  (error) => {
    console.log('error', error);
    // store.dispatch('setErrorMessage', { error: error.response.data });

    return Promise.reject(error);
  }
);

export { http };
