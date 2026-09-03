import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from './socket';

// Cấu hình STUN & TURN toàn cầu (kèm TURN Server OpenRelay hỗ trợ UDP/TCP cổng 80 và 443 xuyên tường lửa và 4G)
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

const serializeDescription = (desc) => {
  if (!desc) return null;
  return {
    type: desc.type,
    sdp: desc.sdp,
  };
};

export function useVoiceChat({ roomCode, myId, myRole, isAlive, gameState }) {
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [voiceStates, setVoiceStates] = useState({}); // { [peerId]: { inVoice, isMuted, isSpeaking } }
  const [activeChannel, setActiveChannel] = useState('LOBBY'); // 'LOBBY' | 'VILLAGE' | 'WEREWOLF' | 'GHOST' | 'SLEEP'
  const [connectedPeerCount, setConnectedPeerCount] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // peerId -> RTCPeerConnection
  const audioElementsRef = useRef(new Map()); // peerId -> HTMLAudioElement
  const peerGainsRef = useRef(new Map()); // peerId -> GainNode (Web Audio API)
  const pendingCandidatesRef = useRef(new Map()); // peerId -> [RTCIceCandidateInit]
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animFrameRef = useRef(null);
  const isSpeakingLocalRef = useRef(false);

  // Tạo container ẩn trên DOM để chứa các thẻ <audio>
  useEffect(() => {
    let container = document.getElementById('webrtc-audio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'webrtc-audio-container';
      container.style.display = 'none';
      document.body.appendChild(container);
    }
  }, []);

  // Xác định kênh thoại dựa trên trạng thái game và vai trò
  useEffect(() => {
    if (!gameState || gameState.phase === 'LOBBY') {
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

  // Cập nhật số lượng peer đã kết nối P2P thành công
  const updateConnectedCount = useCallback(() => {
    let count = 0;
    peerConnectionsRef.current.forEach((pc) => {
      if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected') {
        count++;
      }
    });
    setConnectedPeerCount(count);
  }, []);

  // Cập nhật âm lượng / lọc âm thanh theo luật chơi
  const updateAudioFiltering = useCallback(() => {
    const isLobby = !gameState || gameState.phase === 'LOBBY';
    const phase = gameState?.phase;
    const players = gameState?.players || [];

    peerConnectionsRef.current.forEach((pc, peerId) => {
      let targetVolume = 1.0;
      if (isDeafened) {
        targetVolume = 0;
      } else if (isLobby) {
        targetVolume = 1.0;
      } else {
        const peer = players.find((p) => p.id === peerId);
        if (!peer) {
          targetVolume = 1.0;
        } else if (!isAlive) {
          targetVolume = 1.0;
        } else if (!peer.isAlive) {
          targetVolume = 0;
        } else if (phase === 'NIGHT') {
          targetVolume = (myRole === 'werewolf' && peer.role === 'werewolf') ? 1.0 : 0;
        } else {
          targetVolume = 1.0;
        }
      }

      // Cập nhật GainNode qua Web Audio API
      const gainNode = peerGainsRef.current.get(peerId);
      if (gainNode) {
        gainNode.gain.value = targetVolume;
      }

      // Cập nhật thẻ <audio>
      const audioEl = audioElementsRef.current.get(peerId);
      if (audioEl) {
        audioEl.volume = targetVolume;
        audioEl.muted = targetVolume === 0;
      }
    });
  }, [gameState, isAlive, isDeafened, myRole]);

  useEffect(() => {
    updateAudioFiltering();
  }, [updateAudioFiltering]);

  // Khởi tạo Audio Analyser và đo âm lượng mic
  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = audioCtxRef.current || new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
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
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(normalizedVol);

        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        const isSpeakingNow = average > 14 && audioTrack && audioTrack.enabled && !audioTrack.muted;

        if (isSpeakingNow) {
          speakingCounter = Math.min(speakingCounter + 1, 8);
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
      console.warn('[WebRTC] Audio analyser error:', err);
    }
  };

  // Tạo WebRTC Peer Connection
  const createPeerConnection = useCallback((peerId, isInitiator = false) => {
    let pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      if (localStreamRef.current) {
        const senders = pc.getSenders();
        localStreamRef.current.getAudioTracks().forEach((track) => {
          const alreadyAdded = senders.some((s) => s.track === track);
          if (!alreadyAdded) {
            try {
              pc.addTrack(track, localStreamRef.current);
            } catch (err) {
              console.warn('[WebRTC] Error re-adding track:', err);
            }
          }
        });
      }

      if (isInitiator) {
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('voice:signal', {
              targetId: peerId,
              signal: serializeDescription(pc.localDescription),
            });
          })
          .catch((err) => console.error('[WebRTC] Error creating re-offer:', err));
      }
      return pc;
    }

    pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionsRef.current.set(peerId, pc);

    // Gửi track mic cục bộ tới peer nếu có
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (e) {
          console.warn('[WebRTC] Error adding track:', e);
        }
      });
    }

    // Gửi ICE Candidate tới peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voice:signal', {
          targetId: peerId,
          signal: { type: 'candidate', candidate: event.candidate.toJSON() },
        });
      }
    };

    // Nhận remote audio stream và phát kép qua Web Audio API & HTMLAudioElement
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Nhận remote audio track từ ${peerId}:`, event);
      const remoteStream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);

      // 1. Phát qua Web Audio API (Chống 100% việc trình duyệt chặn autoplay)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(remoteStream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode).connect(ctx.destination);
        peerGainsRef.current.set(peerId, gainNode);
      } catch (e) {
        console.warn('[WebRTC] WebAudio routing fallback to HTMLAudio:', e);
      }

      // 2. Đồng thời gắn thẻ <audio> làm dự phòng
      let audioEl = audioElementsRef.current.get(peerId);
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = `remote-audio-${peerId}`;
        audioEl.autoplay = true;
        audioEl.setAttribute('playsinline', 'true');
        audioEl.setAttribute('autoplay', 'true');

        const container = document.getElementById('webrtc-audio-container') || document.body;
        container.appendChild(audioEl);
        audioElementsRef.current.set(peerId, audioEl);
      }

      audioEl.srcObject = remoteStream;
      audioEl.volume = 1.0;
      audioEl.muted = false;

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`[WebRTC] Autoplay pending user gesture for ${peerId}:`, err);
        });
      }
      updateAudioFiltering();
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE Connection State với ${peerId}:`, pc.iceConnectionState);
      updateConnectedCount();
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection State với ${peerId}:`, pc.connectionState);
      updateConnectedCount();
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeer(peerId);
      }
    };

    // Nếu là initiator thì tạo offer gửi cho peer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('voice:signal', {
            targetId: peerId,
            signal: serializeDescription(pc.localDescription),
          });
        })
        .catch((err) => console.error('[WebRTC] Error creating offer:', err));
    }

    return pc;
  }, [updateAudioFiltering, updateConnectedCount]);

  const cleanupPeer = (peerId) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    const gainNode = peerGainsRef.current.get(peerId);
    if (gainNode) {
      try {
        gainNode.disconnect();
      } catch (e) {}
      peerGainsRef.current.delete(peerId);
    }
    const audioEl = audioElementsRef.current.get(peerId);
    if (audioEl) {
      audioEl.srcObject = null;
      if (audioEl.parentNode) {
        audioEl.parentNode.removeChild(audioEl);
      }
      audioElementsRef.current.delete(peerId);
    }
    pendingCandidatesRef.current.delete(peerId);
    updateConnectedCount();
  };

  // Tham gia Voice Chat
  const joinVoice = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const dummyCtx = audioCtxRef.current || new AudioCtx();
        if (dummyCtx.state === 'suspended') {
          await dummyCtx.resume().catch(() => {});
        }
        audioCtxRef.current = dummyCtx;
      }

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
        console.warn('[WebRTC] Microphone permission denied or not available. Entering listen-only mode:', micErr);
        setHasMicPermission(false);
      }

      localStreamRef.current = stream;
      if (stream) {
        setupAudioAnalyser(stream);

        // Gắn ngay track âm thanh vào các peer connections hiện có
        peerConnectionsRef.current.forEach((pc, pId) => {
          stream.getAudioTracks().forEach((track) => {
            const senders = pc.getSenders();
            const exists = senders.some((s) => s.track === track);
            if (!exists) {
              try {
                pc.addTrack(track, stream);
                pc.createOffer({ offerToReceiveAudio: true })
                  .then((offer) => pc.setLocalDescription(offer))
                  .then(() => {
                    socket.emit('voice:signal', {
                      targetId: pId,
                      signal: serializeDescription(pc.localDescription),
                    });
                  })
                  .catch(() => {});
              } catch (e) {
                console.warn('[WebRTC] Error adding track after stream acquired:', e);
              }
            }
          });
        });
      }

      setInVoice(true);
      setIsMuted(false);
      socket.emit('voice:join');
    } catch (err) {
      console.error('[WebRTC] Failed to join voice:', err);
    }
  };

  // Tính năng thử loa và mic (phát lại tiếng mình sau 0.5 giây)
  const testMicrophone = () => {
    if (!localStreamRef.current) {
      alert('Vui lòng bật Voice Chat trước khi thử mic!');
      return;
    }
    setIsTestingMic(true);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const source = ctx.createMediaStreamSource(localStreamRef.current);
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.4;
      const gain = ctx.createGain();
      gain.gain.value = 0.9;

      source.connect(delay).connect(gain).connect(ctx.destination);

      setTimeout(() => {
        try {
          source.disconnect();
          delay.disconnect();
          gain.disconnect();
        } catch (e) {}
        setIsTestingMic(false);
      }, 3500);
    } catch (e) {
      console.warn('Test mic error:', e);
      setIsTestingMic(false);
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

    peerGainsRef.current.forEach((gain) => {
      try { gain.disconnect(); } catch (e) {}
    });
    peerGainsRef.current.clear();

    audioElementsRef.current.forEach((el) => {
      el.srcObject = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    audioElementsRef.current.clear();
    pendingCandidatesRef.current.clear();

    setInVoice(false);
    setConnectedPeerCount(0);
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
      toggleMute();
    }
  };

  // Lắng nghe các Socket sự kiện WebRTC
  useEffect(() => {
    const handleAllPeers = ({ peers }) => {
      peers.forEach((peerId) => {
        createPeerConnection(peerId, true);
      });
    };

    const handlePeerJoined = ({ peerId }) => {
      createPeerConnection(peerId, false);
    };

    const handleSignal = async ({ senderId, signal }) => {
      let pc = peerConnectionsRef.current.get(senderId);
      if (!pc) {
        pc = createPeerConnection(senderId, false);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          const pending = pendingCandidatesRef.current.get(senderId) || [];
          for (const cand of pending) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (err) {
              console.warn('[WebRTC] Error applying queued candidate:', err);
            }
          }
          pendingCandidatesRef.current.delete(senderId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('voice:signal', {
            targetId: senderId,
            signal: serializeDescription(pc.localDescription),
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          const pending = pendingCandidatesRef.current.get(senderId) || [];
          for (const cand of pending) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (err) {
              console.warn('[WebRTC] Error applying queued candidate:', err);
            }
          }
          pendingCandidatesRef.current.delete(senderId);
        } else if (signal.type === 'candidate' && signal.candidate) {
          if (!pc.remoteDescription) {
            if (!pendingCandidatesRef.current.has(senderId)) {
              pendingCandidatesRef.current.set(senderId, []);
            }
            pendingCandidatesRef.current.get(senderId).push(signal.candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error('[WebRTC] Signal handling error:', err);
      }
    };

    const handleStateSync = ({ voiceStates: states }) => {
      const stateMap = {};
      states.forEach((s) => {
        stateMap[s.id] = s;
      });
      setVoiceStates(stateMap);
    };

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
    connectedPeerCount,
    micVolume,
    isTestingMic,
    testMicrophone,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
  };
}
