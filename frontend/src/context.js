import axios from "axios";
import React, { createContext, useContext, useCallback } from "react";
import { initialState, reducer } from "./reducer";
import { v4 } from "uuid";
const AppContext = createContext();

const Context = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  React.useEffect(() => console.log(state), [state]);

  const loadUser = useCallback(async () => {
    try {
      const response = await axios.get("/api/auth/user");
      if (response.status === 200) {
        dispatch({ type: "SET_USER", payload: response.data });
      }
    } catch (error) {
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  const searchFunc = async (query, type) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      const body = JSON.stringify({ query: state.search, type: type });
      const response = await axios.post("/api/listing/search", body, config);
      dispatch({ type: "SET_LISTINGS", payload: response.data });
    } catch (error) {
      console.log(error.response);
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error, "herre");
    }
  };

  const continueGoogle = async (history) => {
    try {
      const loginURL = "http://localhost:5000/api/auth/google";
      let newWindow = window.open(loginURL, "_blank", "width=500,height=600");
      if (newWindow) {
        let timer = setInterval(async () => {
          if (newWindow.closed) {
            setTimeout(async () => {
              const response = await axios.get("/api/auth/user");
              setAlert("success", `Welcome ${response.data.username}`);
              history.push("/");
            }, 100);
            if (timer) clearInterval(timer);
            return;
          }
        }, 50);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setAlert = (type, msg) => {
    const id = v4();
    dispatch({
      type: "SET_ALERT",
      payload: { type, msg, id },
    });
    setTimeout(() => dispatch({ type: "REMOVE_ALERT", payload: { id } }), 3000);
  };
  // Authenticate User
  const loginUser = async (email, password, history) => {
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    const body = JSON.stringify({ email, password });
    try {
      const response = await axios.post("/api/auth/login", body, config);
      dispatch({ type: "SET_USER", payload: response.data });
      setAlert("success", `Welcome ${response.data.username}!`);
      history.push("/");
    } catch (error) {
      if (error.response.status === 401) {
        return setAlert("danger", "Invalid Credentials");
      }
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  };

  const logout = async () => {
    await axios.get("/api/auth/logout");
    dispatch({ type: "CLEAR_USER" });
    setAlert("success", "Logged Out!");
  };
  const registerUser = async (
    email,
    username,
    password,
    password2,
    history
  ) => {
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    const body = JSON.stringify({ email, username, password, password2 });
    try {
      await axios.post("/api/auth/register", body, config);
      setAlert("success", "Account Created!");
      loadUser();
      history.push("/login");
    } catch (error) {
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  };

  const fetchListings = useCallback(async () => {
    try {
      const response = await axios.get("/api/listing");
      dispatch({ type: "SET_LISTINGS", payload: response.data });
    } catch (error) {
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  }, []);

  const fetchSingleListing = useCallback(async (id) => {
    try {
      const response = await axios.get(`/api/listing/${id}`);
      dispatch({ type: "SET_LISTING", payload: response.data });
    } catch (error) {
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  }, []);

  const joinRoom = async (id) => {
    try {
      const response = await axios.get(`/api/listing/join/${id}`);
      if (response.data === "remove") {
        dispatch({ type: "LEAVE_ROOM" });
        setAlert("success", "Left");
      } else {
        dispatch({ type: "JOIN_ROOM" });
        setAlert("success", "Joined!");
      }
    } catch (error) {
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  };

  const createListing = async (
    location,
    date,
    sport,
    slotsLeft,
    remarks,
    history
  ) => {
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    const body = JSON.stringify({
      location,
      date,
      sport,
      slotsLeft,
      remarks,
    });
    try {
      await axios.post("/api/listing", body, config);
      history.push("/");
      setAlert("success", "Listing Created!");
    } catch (error) {
      console.log(error.response);
      error.response.data.errors.forEach((error) => {
        setAlert("danger", error.msg);
      });
      console.error(error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        fetchListings,
        createListing,
        registerUser,
        fetchSingleListing,
        loadUser,
        joinRoom,
        logout,
        loginUser,
        state,
        searchFunc,
        dispatch,
        setAlert,
        continueGoogle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(AppContext);
};

export default Context;
export { useGlobalContext };
