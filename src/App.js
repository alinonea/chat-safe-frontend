import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChatPage from './components/ChatPage';
import RoomsPage from './components/RoomsPage';
import socketIO from 'socket.io-client';
import { CookiesProvider } from 'react-cookie';

const socket = socketIO.connect('http://localhost:3000');

socket.on("connect", (socket)=> {
  // console.log(socket.id)
  // socket.emit('get-recent-messages', 'Alin12')
  console.log('connected')
})

function App() {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home socket={socket} />}></Route>
          <Route path="/rooms" element={<RoomsPage socket={socket} />}></Route>
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
    </CookiesProvider>
  );
}

export default App