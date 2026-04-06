import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../services/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));
      const data = await register({ email, username, password });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Registration failed";
      dispatch(setError(errorMsg));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password });
      dispatch(setUser(data.user));
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Login failed";
      dispatch(setError(errorMsg));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      if (data && data.user) {
        dispatch(setUser(data.user));
      }
    } catch (err) {
      // Intentionally NOT setting global error here.
      // 401s are expected when a user simply isn't logged in yet,
      // and shouldn't pop up a validation error on the login screen.
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Logout failed"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
}
