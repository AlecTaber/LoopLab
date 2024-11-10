import bycrypt from 'bcryptjs';
import user, { IUser } from '../models/User.ts';
import { generatToken } from '../utils/jwt';