import { UserType, HandicapType, AccompagnantType } from '../../user/user.entity';

export class RegisterDto {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userType: UserType;
  handicapType?: HandicapType;
  accompagnantType?: AccompagnantType;
}