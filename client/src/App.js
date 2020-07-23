import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './app.scss';

const App = () => {
  const [metrics, setMetrics] = useState({
    data: null,
  });

  const [time, setTime] = useState({
    data: null,
    serverTime: null,
    timeDifference: null,
  });
  const [timeSinceLastReq, setTimeSinceLastReq] = useState('00:00:00');

  const [loading, setLoading] = useState(false);
  let count = 0;
  
  useEffect(() => {
    setLoading(true);
    
    Promise.all([fetchMetricsData(), fetchTimeData()]);
  }, []);

  const fetchMetricsData = async (url) => {
    await axios
      .get('/metrics', { 
        headers: { 'Authorization': 'mysecrettoken' } 
      })
      .then((res) => {
        if (res && res.status === 200) {
          console.log(res)
          setMetrics({ 
            data: res.data, 
          });
          setLoading(false);
        }
      })
      .catch((err) => console.log(err, '=== METRICS FETCH ERROR ==='));

    setTimeout( fetchMetricsData, 30000 );
  };

  const fetchTimeData = async () => {
    await axios
      .get('/time', { 
        headers: { 'Authorization': 'mysecrettoken' } 
      })
      .then((res) => {
        if (res && res.status === 200) {
          const epochSeconds = new Date(res.headers.date).getTime();
          const serverTime = new Date(res.headers.date);
          const date = new Date();
          const cTime = {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
          }
          const sTime = {
            hours: serverTime.getHours(),
            minutes: serverTime.getMinutes(),
            seconds: serverTime.getSeconds(),
          }
          const difference = getTimeDifference(cTime, sTime);

          console.log(difference )
          setTime({ 
            loading: false, 
            data: res.data, 
            serverTime: epochSeconds,
            timeDifference: difference
          });
          setLoading(false);
        }
      })
      .catch((err) => console.log(err, '=== TIME FETCH ERROR ==='));
    
      setInterval(() => {
        count++;
        let hours = 0;
        let minutes = 0;
        let seconds = count;
        if(seconds >= 60) {
          count = 0;
          minutes++
        } else if(minutes > 60) {
          minutes = 0;
          hours++
        }
        const time = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
        setTimeSinceLastReq(time);
      }, 1000)
    setTimeout( fetchTimeData, 30000 );
  };

  const leftElement = <div className="container__left"> 
    <h3>SERVER EPOCH TIME: {time.serverTime}</h3>
    <h3>SERVER AND CLIENT TIME DIFFERENCE: {time.timeDifference}</h3>
    <h3>TIME SINCE LAST REQUEST: {timeSinceLastReq}</h3>
  </div>;
  const rightElement = <div className="container__right"><pre><code>{metrics.data}</code></pre></div>;
  const loadingElement = <div className="loading"><h3>IS LOADING</h3></div>;

  return (
    <div className="container">
      {loading ? loadingElement : leftElement}
      {loading ? loadingElement : rightElement}
      </div>
      );
}

const getTimeDifference = (a, b) => {
  const diff = {
    hours: formatTime(a.hours - b.hours),
    minutes: formatTime(a.minutes - b.minutes),
    seconds: formatTime(a.seconds - b.seconds),
  }

  return diff.hours + ':' + diff.minutes + ':' + diff.seconds;
}

const formatTime = (time) => {
  return time < 10 ? '0' + time : time;
}


export default App;
