import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 & 20 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      // the ! to tell typescript to neglect that as we checking that env variable is provided in the entry-point file
      process.env.JWT_KEY!
    );

    // store it on session object
    req.session = { jwt: jwtToken };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
