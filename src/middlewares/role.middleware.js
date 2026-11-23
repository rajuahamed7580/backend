import AppError from '../utils/AppError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'You are not authenticated!'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, `Access denied. You do not have permission to perform this action.`)
      );
    }

    next();
  };
};

export default authorize;
