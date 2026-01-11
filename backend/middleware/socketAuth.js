import jwt from 'jsonwebtoken';

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = payload.userId;

    next();
  } catch(err) {
    console.error(err);
    next(new Error("Unauthorized"));
  }
}

export default socketAuth;