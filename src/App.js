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

  useEffect(() => {
    const ws = new WebSocket(SOCKET_URL);
    ws.onopen = (event) => {
      if (event.type === serverStatus.OPEN) {
        toast.dismiss();
        toast.success(SERVER_CONNECTED_MESSAGE);
      }
    };
    ws.onclose = (event) => {
      console.log(event)
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

    const closeWebsocket = () => {
      ws.close();
    };

    setTimeout(closeWebsocket, SOCKET_CLOSING_TIMEOUT);

  }, []);




  return (
    <>
      <div className="row">
        <div className="child-div">
        <label><strong className='child-strong'>ID 1 </strong></label>
         <div className="temperature one" >Temp {temperatureOne} c</div>
        </div>
        <div className="child-div">
        <label><strong className='child-strong'>ID 2 </strong></label> 
        <div className="temperature two">Temp {temperatureTwo} c</div>
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
          <Line type="linear" dataKey="temperature2" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      <ToastContainer />
    </>
  );
}

export default App;
