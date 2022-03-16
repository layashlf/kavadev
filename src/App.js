import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  serverStatus,
  SERVER_CONNECTED_MESSAGE,
  SERVER_CONNECTION_ERROR_MESSAGE,
  SERVER_DISCONNECTED_MESSAGE,
  SOCKET_CLOSING_TIMEOUT,
  SOCKET_CLOSING_TIMEOUT_MESSAGE,
  SOCKET_URL,
} from "./constants/socket.constants";
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
  const [dataTwo, setDataTwo] = useState([]);
  const [temperatureOne, setDataTemperatureOne] = useState([]);
  const [temperatureTwo, setDataTemperatureTwo] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(SOCKET_URL, "ws");

    ws.onopen = (event) => {
      console.log("open", event);
      if (event.type === serverStatus.OPEN) {
        toast.dismiss();
        toast.success(SERVER_CONNECTED_MESSAGE);
      }
    };

    ws.onclose = (event) => {
      console.log("close", event);
      toast.dismiss();

      if (event.wasClean) {
        toast.error(event.reason);
      } else {
        toast.error(SERVER_DISCONNECTED_MESSAGE);
      }
    };

    ws.onerror = (event) => {
      console.log("error", event);
      if (event.type === serverStatus.ERROR) {
        toast.dismiss();
        toast.error(SERVER_CONNECTION_ERROR_MESSAGE);
      }
    };

    ws.onmessage = (temperatureData) => {
      let graphData = {};
      const parsedData = JSON.parse(temperatureData.data);
      parsedData.forEach((element) => {
        if (element.data < 100) {
          graphData["dataValue"] = element.data;
          graphData["timestamp"] = element.timestamp;

          if (element.id === 1) {
            graphData["temperature1"] = element.temperature;
            setDataTemperatureOne(element.temperature);
          } else {
            graphData["temperature2"] = element.temperature;
            setDataTemperatureTwo(element.temperature);
          }
          if ("temperature1" in graphData && "temperature2" in graphData) {
            console.log(parsedData, graphData);
            setData((currentData) => [...currentData, graphData]);
          }
        }
      });
    };

    const closeWebsocket = () => {
      console.log("called");
      ws.close(1000, SOCKET_CLOSING_TIMEOUT_MESSAGE);
    };

    const timer = setTimeout(closeWebsocket, SOCKET_CLOSING_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="row">
        <div className="child-div">
          <label>
            <strong className="child-strong">ID 1 </strong>
          </label>

          <div className="temperature one">Temp {temperatureOne} °C</div>
        </div>
        <div className="child-div">
          <label>
            <strong className="child-strong">ID 2 </strong>
          </label>
          <div className="temperature two">Temp {temperatureTwo} °C</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={400}
          height={200}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis  type="number" />
          <YAxis  datakey="dataValue" label={"Data"} />
          <Tooltip />
          <Legend />
          <Line
            connectNulls
            type="linear"
            dataKey="temperature1"
            stroke="#8884d8"
          />
          <Line
            connectNulls
            type="linear"
            dataKey="temperature2"
            stroke="#82ca9d"
          />
        </LineChart>
      </ResponsiveContainer>
      <ToastContainer />
    </>
  );
}

export default App;
