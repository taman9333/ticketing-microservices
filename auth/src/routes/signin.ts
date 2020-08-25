import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Password } from '../services/password';
import { validateRequest, BadRequestError } from '@ttickets/common';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await Password.compare(user.password, password))) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY!
    );

    // store it on session object
    req.session = { jwt: jwtToken };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
