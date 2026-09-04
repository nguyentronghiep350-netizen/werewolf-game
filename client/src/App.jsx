import React, { useState, useEffect } from 'react';
import { socket } from './utils/socket';
import Header from './components/Header';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameScreen from './components/GameScreen';
import RoleGuideModal from './components/RoleGuideModal';
import UserGuideModal from './components/UserGuideModal';
import VoiceControls from './components/VoiceControls';
import GameMasterPanel from './components/GameMasterPanel';
import { useVoiceChat } from './utils/useVoiceChat';

export default function App() {
  const [inRoom, setInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');
  const [myRole, setMyRole] = useState(null);
  const [myRoleDetails, setMyRoleDetails] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [config, setConfig] = useState({});
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [seerResult, setSeerResult] = useState(null);
  const [witchVictim, setWitchVictim] = useState(null);
  const [loverPartner, setLoverPartner] = useState(null);
  const [showRolesGuide, setShowRolesGuide] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const isAlive = gameState?.players?.find((p) => p.id === myId)?.isAlive ?? true;

  const voiceChat = useVoiceChat({
    roomCode,
    myId,
    myRole,
    isAlive,
    gameState,
  });

  useEffect(() => {
    // 1. Cập nhật trạng thái game từ server
    socket.on('game:state_update', (data) => {
      setInRoom(true);
      setRoomCode(data.roomCode);
      setMyId(data.myId);
      setMyRole(data.myRole);
      setMyRoleDetails(data.myRoleDetails);
      setIsHost(data.isHost);
      setConfig(data.config);
      setGameState(data.state);

      // Nếu chuyển về LOBBY thì reset các biến vai trò của ván trước
      if (data.state.phase === 'LOBBY') {
        setSeerResult(null);
        setWitchVictim(null);
        setLoverPartner(null);
      }
    });

    // 2. Nhận tin nhắn chat
    socket.on('chat:message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // 3. Kết quả soi của Tiên tri
    socket.on('seer:inspection_result', (result) => {
      setSeerResult(result);
    });

    // 4. Thông tin nạn nhân cho Phù thủy
    socket.on('witch:victim_info', (victimInfo) => {
      setWitchVictim(victimInfo);
    });

    // 5. Thông báo kết đôi Cupid
    socket.on('game:lover_paired', (partnerInfo) => {
      setLoverPartner(partnerInfo);
    });

    // 6. Cập nhật timer
    socket.on('game:timer', ({ timer }) => {
      setGameState((prev) => (prev ? { ...prev, timer } : null));
    });

    // 7. Cập nhật vote ban ngày theo thời gian thực
    socket.on('game:day_votes_update', ({ votes }) => {
      setGameState((prev) => (prev ? { ...prev, dayVotes: votes } : null));
    });

    // 8. Cập nhật skip thảo luận
    socket.on('game:skip_update', ({ skips }) => {
      setGameState((prev) => (prev ? { ...prev, discussionSkips: skips } : null));
    });

    return () => {
      socket.off('game:state_update');
      socket.off('chat:message');
      socket.off('seer:inspection_result');
      socket.off('witch:victim_info');
      socket.off('game:lover_paired');
      socket.off('game:timer');
      socket.off('game:day_votes_update');
      socket.off('game:skip_update');
    };
  }, []);

  // Thao tác Socket
  const handleCreateRoom = (name, avatar, cb) => {
    socket.emit('room:create', { name, avatar }, (res) => {
      if (res && res.success) {
        setRoomCode(res.roomCode);
        setInRoom(true);
        if (cb) cb(null);
      } else {
        if (cb) cb(res?.message || 'Không thể tạo phòng');
      }
    });
  };

  const handleJoinRoom = (code, name, avatar, cb) => {
    socket.emit('room:join', { code, name, avatar }, (res) => {
      if (res && res.success) {
        setRoomCode(code);
        setInRoom(true);
        if (cb) cb(null);
      } else {
        if (cb) cb(res?.message || 'Không thể vào phòng');
      }
    });
  };

  const handleLeaveRoom = () => {
    try {
      voiceChat.leaveVoice();
    } catch (e) {
      console.warn('Error leaving voice on room leave:', e);
    }
    socket.emit('room:leave');
    setInRoom(false);
    setRoomCode('');
    setGameState(null);
    setChatMessages([]);
  };

  const handleToggleReady = () => {
    socket.emit('room:toggle_ready');
  };

  const handleAddBot = () => {
    socket.emit('room:add_bot');
  };

  const handleRemoveBot = (botId) => {
    socket.emit('room:remove_bot', { botId });
  };

  const handleUpdateConfig = (newConfig) => {
    socket.emit('room:update_config', newConfig);
  };

  const handleStartGame = (cb) => {
    socket.emit('game:start', cb);
  };

  const handleRestartGame = () => {
    socket.emit('game:restart');
  };

  const handleSendMessage = (text, channel) => {
    socket.emit('chat:send', { text, channel });
  };

  const handleNightAction = (actionData) => {
    socket.emit('game:night_action', actionData);
  };

  const handleSkipDiscussion = () => {
    socket.emit('game:skip_discussion');
  };

  const handleDayVote = (targetId) => {
    socket.emit('game:day_vote', { targetId });
  };

  const handleHunterShot = (targetId) => {
    socket.emit('game:hunter_shot', { targetId });
  };

  const handleModeratorAction = (action, data = {}) => {
    socket.emit('moderator:action', { action, data });
  };

  const isLobbyPhase = !gameState || gameState.phase === 'LOBBY';

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Header */}
      <Header
        roomCode={inRoom ? roomCode : null}
        playerCount={gameState?.players?.length}
        onOpenRolesGuide={() => setShowRolesGuide(true)}
        onOpenUserGuide={() => setShowUserGuide(true)}
        onLeaveRoom={inRoom ? handleLeaveRoom : null}
        inGame={!isLobbyPhase}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!inRoom ? (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        ) : isLobbyPhase ? (
          <WaitingRoom
            roomCode={roomCode}
            players={gameState?.players || []}
            myId={myId}
            isHost={isHost}
            config={config}
            onToggleReady={handleToggleReady}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onUpdateConfig={handleUpdateConfig}
            onStartGame={handleStartGame}
            onModeratorAction={handleModeratorAction}
            voiceStates={voiceChat.voiceStates}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            inVoice={voiceChat.inVoice}
            onJoinVoice={voiceChat.joinVoice}
          />
        ) : (
          <GameScreen
            roomCode={roomCode}
            gameState={gameState}
            myId={myId}
            myRole={myRole}
            myRoleDetails={myRoleDetails}
            isHost={isHost}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onNightAction={handleNightAction}
            onSkipDiscussion={handleSkipDiscussion}
            onDayVote={handleDayVote}
            onHunterShot={handleHunterShot}
            onRestartGame={handleRestartGame}
            seerResult={seerResult}
            witchVictim={witchVictim}
            loverPartner={loverPartner}
            voiceStates={voiceChat.voiceStates}
          />
        )}
      </main>

      {/* Bảng Quản Trò Toàn Năng (God Mode & AI Script cho Host) */}
      {inRoom && !isLobbyPhase && isHost && (gameState?.isGodModerator || config?.moderatorMode === 'human' || myRole === 'moderator') && (
        <GameMasterPanel
          isHost={isHost}
          gameState={gameState}
          onModeratorAction={handleModeratorAction}
          myId={myId}
        />
      )}

      {/* Widget Điều Khiển Voice Chat */}
      {inRoom && (
        <VoiceControls
          voiceChat={voiceChat}
          isAlive={isAlive}
        />
      )}

      {/* Cẩm Nang Vai Trò */}
      <RoleGuideModal
        isOpen={showRolesGuide}
        onClose={() => setShowRolesGuide(false)}
      />

      {/* Hướng Dẫn Sử Dụng & Chơi Cùng Bạn Bè */}
      <UserGuideModal
        isOpen={showUserGuide}
        onClose={() => setShowUserGuide(false)}
      />
    </div>
  );
}
