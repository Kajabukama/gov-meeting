const socket = io('/');
let currentVideoStream;
const videoGrid = document.getElementById('video-grid');
const currentVideo =  document.createElement('video');
currentVideo.muted = true;

/**
 * Peer server 
 * configuration options
*/
var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '4000'
});

/**
 * Access media devices api
 * for streaming video and audio
*/
navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
  currentVideoStream = stream;
  addVideoStream(currentVideo, stream);

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });

})
.catch((error) => {
  console.error(error);
  const canvas = document.createElement('canvas');
  videoGrid.append(canvas)
});


/**
 * on peer server connection
 * user/client joins the room
*/
peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id); 
})

/**
 * function to connect a new user to the stream
 * @param {*} userId 
 * @param {*} stream 
*/
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  }) 
}

/**
 * function to add a video session
 * @param video 
 * @param stream 
*/
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}