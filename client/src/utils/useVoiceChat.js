import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from './socket';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useVoiceChat({ roomCode, myId, myRole, isAlive, gameState }) {
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [voiceStates, setVoiceStates] = useState({}); // { [peerId]: { inVoice, isMuted, isSpeaking } }
  const [activeChannel, setActiveChannel] = useState('VILLAGE'); // 'VILLAGE' | 'WEREWOLF' | 'GHOST' | 'SLEEP'

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // peerId -> RTCPeerConnection
  const audioElementsRef = useRef(new Map()); // peerId -> HTMLAudioElement
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animFrameRef = useRef(null);
  const isSpeakingLocalRef = useRef(false);

  // Xác định kênh thoại dựa trên trạng thái game và vai trò
  useEffect(() => {
    if (!gameState) {
      setActiveChannel('LOBBY');
      return;
    }

    if (!isAlive) {
      setActiveChannel('GHOST');
      return;
    }

    const phase = gameState.phase;
    if (phase === 'NIGHT') {
      if (myRole === 'werewolf') {
        setActiveChannel('WEREWOLF');
      } else {
        setActiveChannel('SLEEP');
      }
    } else {
      setActiveChannel('VILLAGE');
    }
  }, [gameState, isAlive, myRole]);

  // Cập nhật âm lượng / cách ly âm thanh giữa các người chơi theo quy tắc Ma Sói
  const updateAudioFiltering = useCallback(() => {
    if (!gameState) return;
    const phase = gameState.phase;
    const players = gameState.players || [];

    audioElementsRef.current.forEach((audioEl, peerId) => {
      if (isDeafened) {
        audioEl.volume = 0;
        return;
      }

      const peer = players.find((p) => p.id === peerId);
      if (!peer) {
        audioEl.volume = 1.0;
        return;
      }

      // 1. Nếu bản thân đã CHẾT: Nghe được tất cả (cả người sống và người chết)
      if (!isAlive) {
        audioEl.volume = 1.0;
        return;
      }

      // 2. Bản thân còn SỐNG:
      // a. Không bao giờ được nghe người chết (chống spoil vai trò)
      if (!peer.isAlive) {
        audioEl.volume = 0;
        return;
      }

      // b. Trong ĐÊM:
      if (phase === 'NIGHT') {
        // Chỉ bầy sói còn sống mới nghe được nhau (thì thầm ban đêm)
        if (myRole === 'werewolf' && peer.role === 'werewolf') {
          audioEl.volume = 1.0;
        } else {
          // Dân làng ban đêm không nghe thấy gì
          audioEl.volume = 0;
        }
        return;
      }

      // c. Ban NGÀY (Thảo luận / Biểu quyết):
      // Tất cả người sống đều nghe được nhau
      audioEl.volume = 1.0;
    });
  }, [gameState, isAlive, isDeafened, myRole]);

  // Gọi updateAudioFiltering mỗi khi gameState, vai trò hoặc trạng thái mute thay đổi
  useEffect(() => {
    updateAudioFiltering();
  }, [updateAudioFiltering]);

  // Khởi tạo Audio Analyser để nhận diện âm lượng đang nói (Speaking indicator)
  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingCounter = 0;

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Nếu âm lượng vượt ngưỡng và mic không bị mute
        const isSpeakingNow = average > 18 && !localStreamRef.current?.getAudioTracks()[0]?.muted && localStreamRef.current?.getAudioTracks()[0]?.enabled;

        if (isSpeakingNow) {
          speakingCounter = Math.min(speakingCounter + 1, 10);
        } else {
          speakingCounter = Math.max(speakingCounter - 1, 0);
        }

        const speakingState = speakingCounter > 2;
        if (speakingState !== isSpeakingLocalRef.current) {
          isSpeakingLocalRef.current = speakingState;
          socket.emit('voice:state_change', { isSpeaking: speakingState });
          setVoiceStates((prev) => ({
            ...prev,
            [myId]: { ...prev[myId], isSpeaking: speakingState },
          }));
        }

        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      console.warn('Audio analyser error:', err);
    }
  };

  // Tạo WebRTC Peer Connection tới peerId
  const createPeerConnection = useCallback((peerId, isInitiator = false) => {
    if (peerConnectionsRef.current.has(peerId)) {
      return peerConnectionsRef.current.get(peerId);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionsRef.current.set(peerId, pc);

    // Gửi track mic cục bộ tới peer nếu có
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Nhận ICE Candidate và gửi tới peer qua Socket.IO
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voice:signal', {
          targetId: peerId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    // Nhận remote audio stream
    pc.ontrack = (event) => {
      let audioEl = audioElementsRef.current.get(peerId);
      if (!audioEl) {
        audioEl = new Audio();
        audioEl.autoplay = true;
        audioElementsRef.current.set(peerId, audioEl);
      }
      audioEl.srcObject = event.streams[0];
      updateAudioFiltering();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeer(peerId);
      }
    };

    // Nếu là initiator thì tạo offer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('voice:signal', {
            targetId: peerId,
            signal: pc.localDescription,
          });
        })
        .catch((err) => console.error('Error creating offer:', err));
    }

    return pc;
  }, [updateAudioFiltering]);

  const cleanupPeer = (peerId) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    const audioEl = audioElementsRef.current.get(peerId);
    if (audioEl) {
      audioEl.srcObject = null;
      audioElementsRef.current.delete(peerId);
    }
  };

  // Tham gia Voice Chat
  const joinVoice = async () => {
    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        setHasMicPermission(true);
      } catch (micErr) {
        console.warn('Microphone permission denied or not available. Entering listen-only mode:', micErr);
        setHasMicPermission(false);
      }

      localStreamRef.current = stream;
      if (stream) {
        setupAudioAnalyser(stream);
      }

      setInVoice(true);
      setIsMuted(false);
      socket.emit('voice:join');
    } catch (err) {
      console.error('Failed to join voice:', err);
    }
  };

  // Rời Voice Chat
  const leaveVoice = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    audioElementsRef.current.forEach((el) => {
      el.srcObject = null;
    });
    audioElementsRef.current.clear();

    setInVoice(false);
    socket.emit('voice:leave');
  }, []);

  // Bật / Tắt Mic
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const newMute = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMute;
    });
    setIsMuted(newMute);
    socket.emit('voice:state_change', { isMuted: newMute });
    setVoiceStates((prev) => ({
      ...prev,
      [myId]: { ...prev[myId], isMuted: newMute },
    }));
  };

  // Bật / Tắt Loa (Deafen)
  const toggleDeafen = () => {
    const newDeaf = !isDeafened;
    setIsDeafened(newDeaf);
    if (newDeaf && !isMuted) {
      // Khi deafen thì tự động mute mic để tránh nói 1 chiều
      toggleMute();
    }
  };

  // Lắng nghe các Socket sự kiện WebRTC
  useEffect(() => {
    // 1. Nhận danh sách các peer hiện có trong phòng khi mới join
    const handleAllPeers = ({ peers }) => {
      peers.forEach((peerId) => {
        createPeerConnection(peerId, true);
      });
    };

    // 2. Peer mới tham gia
    const handlePeerJoined = ({ peerId }) => {
      createPeerConnection(peerId, false);
    };

    // 3. Nhận signal từ peer khác (Offer, Answer, Candidate)
    const handleSignal = async ({ senderId, signal }) => {
      let pc = peerConnectionsRef.current.get(senderId);
      if (!pc) {
        pc = createPeerConnection(senderId, false);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('voice:signal', {
            targetId: senderId,
            signal: pc.localDescription,
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.type === 'candidate' && signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('WebRTC signal handling error:', err);
      }
    };

    // 4. Đồng bộ toàn bộ voice states
    const handleStateSync = ({ voiceStates: states }) => {
      const stateMap = {};
      states.forEach((s) => {
        stateMap[s.id] = s;
      });
      setVoiceStates(stateMap);
    };

    // 5. Cập nhật state của 1 người chơi
    const handlePlayerStateChanged = ({ playerId, isMuted: peerMuted, isSpeaking: peerSpeaking, inVoice: peerInVoice }) => {
      setVoiceStates((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          isMuted: peerMuted !== undefined ? peerMuted : prev[playerId]?.isMuted,
          isSpeaking: peerSpeaking !== undefined ? peerSpeaking : prev[playerId]?.isSpeaking,
          inVoice: peerInVoice !== undefined ? peerInVoice : prev[playerId]?.inVoice,
        },
      }));
    };

    // 6. Peer rời voice
    const handlePeerLeft = ({ peerId }) => {
      cleanupPeer(peerId);
      setVoiceStates((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    };

    socket.on('voice:all_peers', handleAllPeers);
    socket.on('voice:peer_joined', handlePeerJoined);
    socket.on('voice:signal', handleSignal);
    socket.on('voice:state_sync', handleStateSync);
    socket.on('voice:player_state_changed', handlePlayerStateChanged);
    socket.on('voice:peer_left', handlePeerLeft);

    return () => {
      socket.off('voice:all_peers', handleAllPeers);
      socket.off('voice:peer_joined', handlePeerJoined);
      socket.off('voice:signal', handleSignal);
      socket.off('voice:state_sync', handleStateSync);
      socket.off('voice:player_state_changed', handlePlayerStateChanged);
      socket.off('voice:peer_left', handlePeerLeft);
    };
  }, [createPeerConnection]);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    inVoice,
    isMuted,
    isDeafened,
    hasMicPermission,
    voiceStates,
    activeChannel,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
  };
}
