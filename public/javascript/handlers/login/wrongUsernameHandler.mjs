export const wrongUsernameHandler = () => {
    window.location.replace('/login');
    sessionStorage.removeItem('username');
}