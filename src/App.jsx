import {useState, useEffect} from 'react'
import ReactCountryFlag from "react-country-flag/src";
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState({})
  const [users, setUsers] = useState([])
  let page = 2

  useEffect(() => {
    fetch("https://www.speedrun.com/api/v1/leaderboards/nd28z0ed/category/w20e4yvd")
      .then((r) => r.json())
      .then(r => {

        setLeaderboard(r.data)

        setInterval(() => {
          Promise.all(r.data.runs.slice(3 * page, 5 * page).map(({run}) => fetch(`https://www.speedrun.com/api/v1/users/${run.players[0].id}`)))
            .then(r => Promise.all(r.map(response => response.json())))
            .then(r => {
              setUsers(state => {
                const ret = state.slice(0, 3)

                page++

                return [...ret, ...r.map(response => response.data)]
              })
            })
        }, 5000)

        return Promise.all(r.data.runs.slice(0, 8).map(({run}) => fetch(`https://www.speedrun.com/api/v1/users/${run.players[0].id}`)))
      })
      .then(r => Promise.all(r.map(response => response.json())))
      .then(r => {
        setUsers(r.map(response => response.data))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Chargement...</p>
  }

  const renderUsers = (r, index) => {

    if (Array.isArray(users)) {
      const user = users.find(u => u.id === r.run.players[0].id)

      if (user) {
        const userStyle = {
          background: '#000',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }

        switch (user['name-style'].style) {
          case 'gradient':
            userStyle.background = `-webkit-linear-gradient(${user['name-style']['color-from'].light}, ${user['name-style']['color-to'].light})`
            break;
          default:
            userStyle.background = user['name-style'].color.light
            break;
        }

        return <tr key={r.place}>
          <td>{index < 3 ? <img className="trophy" src={`/assets/${index + 1}.png`} alt=""/> : r.place}</td>
          <td>
            <ReactCountryFlag countryCode={user.location.country.code}/>{' '}
            <span style={userStyle}>{user.names.international}</span>
          </td>
          <td>{secondsToHms(r.run.times.realtime_t)}</td>
        </tr>
      }
    }
  }

  const secondsToHms = (d) => {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h + "h ";
    let mDisplay = m + "m ";
    let sDisplay = s + "s";
    return hDisplay + mDisplay + sDisplay;
  }

  return (
    <div className="App">
      <table>
        <thead>
        <tr>
          <th>Classement</th>
          <th>Drapeau + Nom des joueurs</th>
          <th>temps</th>
        </tr>
        {leaderboard.runs.map((r, i) => renderUsers(r, i))}
        </thead>
      </table>
    </div>
  )
}

export default App
