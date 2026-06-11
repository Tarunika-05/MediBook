const authService = require("../services/authService");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({ success: true, data: { user, token: accessToken } });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, data: { user, token: accessToken } });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);
    
    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ success: true, data: { user, token: accessToken } });
  } catch (error) {
    res.clearCookie('refreshToken');
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await authService.revokeRefreshToken(refreshToken);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout };
