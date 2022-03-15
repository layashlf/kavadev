import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "../node_modules/react-vis/dist/style.css";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  serverStatus,
  SERVER_CONNECTED_MESSAGE,
  SERVER_CONNECTION_ERROR_MESSAGE,
  SERVER_DISCONNECTED_MESSAGE,
  SOCKET_CLOSING_TIMEOUT,
  SOCKET_URL,
} from "./constants/socket.constatns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function App() {
  const [data, setData] = useState([]);
  const [temperatureOne, setDataTemperatureOne] = useState([]);
  const [temperatureTwo, setDataTemperatureTwo] = useState([]);
  let temperature1 = 0;
  let temperature2 = 0;

  useEffect(() => {
    const ws = new WebSocket(SOCKET_URL);
    ws.onopen = (event) => {
      if (event.type === serverStatus.OPEN) {
        toast.dismiss();
        toast.success(SERVER_CONNECTED_MESSAGE);
      }
    };
    ws.onclose = (event) => {
      if (event.type === serverStatus.CLOSE) {
        toast.dismiss();
        toast.error(SERVER_DISCONNECTED_MESSAGE);
      }
    };
    ws.onerror = (event) => {
      if (event.type === serverStatus.ERROR) {
        toast.dismiss();
        toast.error(SERVER_CONNECTION_ERROR_MESSAGE);
      }
    };

    ws.onmessage = (temperatureData) => {
      const parsedData = JSON.parse(temperatureData.data);
      let graphData = {};

      parsedData.forEach((element) => {
        if (element.data <= 100) {
          graphData = {
            timeStamp: new Date(parsedData[0].timestamp).getMinutes(),
            temperature1: parsedData[0].temperature,
            temperature2: parsedData[1].temperature,
          };
          setDataTemperatureOne(parsedData[0].temperature);
          setDataTemperatureTwo(parsedData[1].temperature);
          setData((currentData) => [...currentData, graphData]);
        }
      });
    };

    const closeWs = () => {
      ws.close();
    };
    console.log(1, temperature1, temperature2);
    setTimeout(closeWs, SOCKET_CLOSING_TIMEOUT);
  }, [temperature1, temperature2]);
  console.log(2, temperature1, temperature2);
  return (
    <>
      <div className="row">
        <div className="child-div">
          ID 1<div className="temperature">Temp {temperatureOne} c</div>
        </div>
        <div className="child-div">
          ID 2 <div className="temperature">Temp {temperatureTwo} c</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart width={400} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timeStamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="linear"
            dataKey="temperature1"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="temperature2" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      <ToastContainer />
    </>
  );
}

export default App;
