import {
  Model,
  Document,
  Schema,
  model,
  HookNextFunction,
  Aggregate,
} from 'mongoose';
import jwt from 'jwt-simple';
import * as argon2 from 'argon2';
import { ObjectID } from 'bson';
import Academy, { IAcademy } from './Academy';
import License from './License';

export interface IStudentDefaultLogin {
  studentID: string;
  licenseKey: string;
  password: string;
}
export interface IStudentToken {
  _id: string;
  studentID: string;
  lastLoginTime?: Date;
  academy: ObjectID | IAcademy | string;
}
export interface IStudent {
  studentID: string;
  password: string;
  academy: ObjectID | IAcademy | string;
  name?: string;
  email?: string;
  lastLoginTime?: Date;
  createdTime?: Date;
}

export const StudentSchema: Schema = new Schema({
  name: { type: String, default: 'DefaultUserName' },
  email: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  studentID: { type: String, required: true, unique: true },
  academy: { type: ObjectID, required: true, ref: 'Academy' },
  lastLoginTime: { type: Date, default: Date.now },
  createdTime: { type: Date, default: Date.now },
});

const TESTUSER_NAME = process.env.TESTUSER_NAME || 'testuser';
const TOKEN_EXPIRATION = Number(process.env.TOKEN_EXPIRATION) || 600000;

/**
 * @description Student 스키마에 대한 메서드 ( document )
 */
export interface IStudentSchema extends IStudent, Document {
  /**
   * @description 이 계정에 대한 토큰을 생성합니다.
   * @returns {string} 이 계정에 대한 토큰을 반환합니다.
   */
  getStudentToken(): string;
  /**
   * @description 비밀번호를 재설정합니다
   * @param {string}password 새 비밀번호
   * @returns {Promise<IUserSchema>} 변경된 계정를 반환합니다.
   */
  resetPassword(password: string): Promise<IStudentSchema>;
  /**
   * @description 계정 정보를 재설정합니다
   * @param {string}IUser 계정 정보
   * @returns {Promise<IUserSchema>} 변경된 계정를 반환합니다.
   */
  changeInfo(user: IStudent): Promise<IStudentSchema>;
  /**
   * @description 중요 정보를 숨기고 객체화 시킵니다.
   * @returns {Promise<IUserSchema>} 변환된 객체를 반환합니다.
   */
  // toJSON(): IStudent;
}

/**
 * @description User 모델에 대한 정적 메서드 ( collection )
 */
export interface IStudentModel extends Model<IStudentSchema> {
  /**
   * @description 입력받은 계정의 토큰을 생성합니다.
   * @returns {string} 입력받은 계정에 대한 토큰
   */
  getToken(data: IStudentSchema): string;
  /**
   * @description 암호화 할 비밀번호를 입력받아 비밀번호와 암호화 키를 반환합니다.
   * @param {string}password 암호화 할 비밀번호
   * @returns {Promise<string>} 비밀번호와 암호화 키를 반환합니다.
   */
  createEncryptionPassword(password: string): Promise<string>;
  /**
   * @description 계정을 만듭니다.
   * @param {string}password 암호화 할 비밀번호
   * @returns {Promise<EncryptionPassword>} 비밀번호와 암호화 키를 반환합니다.
   */
  createStudent(data: IStudent): Promise<IStudentSchema>;
  /**
   * @description 이메일과 패스워드로 로그인을 시도합니다
   * @param loginData 로그인 정보
   * @param {boolean}isEncryptionPassword 평문 비밀번호가 아닐 시 (토큰 사용 로그인 시)
   * @param {boolean}isPasswordSkip 비밀번호 무시 (세션 정보로 로그인 정보 갱신 시)
   * @returns {Promise<IUserSchema>} 로그인 성공 시 계정를 반환합니다.
   */
  loginAuthentication(
    loginData: IStudentDefaultLogin,
    isEncryptionPassword?: boolean,
    isPasswordSkip?: boolean
  ): Promise<IStudentSchema>;
  /**
   * @description 유저 아이디로 계정을 찾을 수 없다
   * @param {string}userID 유저 아이디
   * @param {ObjectID}academy 학원 OID
   * @returns {Promise<IUserSchema>} 계정이 있을 시 반환합니다.
   */
  findByStudentID(userID: string, academy: ObjectID): Promise<IStudentSchema>;
  /**
   * @description 테스트 계정 생성
   * @returns {Promise<IUserSchema>} 테스트 계정 생성 성공 시 반환합니다.
   */
  createTestUser(): Promise<IStudentSchema>;

  getStudentsWithScore(): Aggregate<
    | IStudentSchema
    | { additional_score: number; score: number; probs_score: number }
  >;
}

StudentSchema.methods.getUserToken = function (this: IStudentSchema): string {
  const constructor = this.constructor as IStudentModel;
  return constructor.getToken(this);
};

StudentSchema.methods.resetPassword = async function (
  this: IStudentSchema,
  password: string
): Promise<IStudentSchema> {
  try {
    const constructor = this.constructor as IStudentModel;
    const encryptionPassword = await constructor.createEncryptionPassword(
      password
    );
    this.password = encryptionPassword;
    return await this.save();
  } catch (err) {
    throw err;
  }
};

StudentSchema.methods.changeInfo = async function (
  this: IStudentSchema,
  user: IStudent
): Promise<IStudentSchema> {
  try {
    Object.keys(user).forEach((key) => {
      this[key] = user[key];
    });
    return await this.save();
  } catch (err) {
    throw err;
  }
};

StudentSchema.methods.toJSON = function (this: IStudentSchema): IStudent {
  const json = this.toObject();
  delete json['password'];
  // delete json['salt'];
  return json;
};

StudentSchema.statics.getToken = function (
  // this: IStudentModel,
  data: IStudentSchema
): string {
  const user: IStudentToken = {
    _id: data._id,
    studentID: data.studentID,
    lastLoginTime: data.lastLoginTime,
    academy: data.academy,
  };
  return jwt.encode(user, process.env.SECRET_KEY || 'SECRET');
};

StudentSchema.statics.createEncryptionPassword = async function (
  // this: IStudentModel,
  password: string
): Promise<string> {
  return await argon2.hash(password);
};

StudentSchema.statics.createStudent = async function (
  data: IStudent
): Promise<IStudentSchema> {
  const model = (this as unknown) as IStudentModel;

  if ('studentID' in data && 'password' in data && 'academy' in data) {
    if (await model.findByStudentID(data.studentID, data.academy as ObjectID))
      throw new Error('Account Already Exists');
    const encryptionPassword = await model.createEncryptionPassword(
      data.password
    );
    data.password = encryptionPassword;
    return await new model(data).save();
  } else {
    throw new Error('Missing params');
  }
};

StudentSchema.statics.findByStudentID = async function (
  studentID: string,
  academy: ObjectID
) {
  const model = (this as unknown) as IStudentModel;
  return await model.findOne({ studentID, academy });
};

StudentSchema.statics.loginAuthentication = async function (
  loginData: IStudentDefaultLogin
): Promise<boolean | IStudentSchema> {
  const model = (this as unknown) as IStudentModel;

  const license = await License.findOne({ licenseKey: loginData.licenseKey });
  if (license == null) return false;
  const academy = await Academy.findOne({ license: license._id });
  if (academy == null) return false;

  const user: IStudentSchema | null = await model.findOne(
    { studentID: loginData.studentID, academy: academy._id },
    '+password +salt'
  );
  const now: Date = new Date();

  if (!user) {
    return false;
    // throw new Error('Account not exists');
  } else {
    // 평문 비밀번호는 암호화된 비밀번호로 변환
    // const password: string = isEncryptionPassword
    //   ? loginData.password
    //   : await model.createEncryptionPassword(loginData.password);
    if (await argon2.verify(user.password, loginData.password)) {
      user.lastLoginTime = now;
      return await user.save();
    } else {
      return false; // throw new Error('Password not correct');
    }
    // } else throw new Error('Token expired');
  }
};

StudentSchema.statics.getStudentsWithScore = async function () {
  const model = (this as unknown) as IStudentModel;
  return model.aggregate([
    {
      $lookup: {
        from: 'answerlogs',
        localField: '_id',
        foreignField: 'student',
        as: 'solved',
      },
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'solved.problem',
        foreignField: '_id',
        as: 'solvedprobs',
      },
    },
    {
      $lookup: {
        from: 'scores',
        localField: '_id',
        foreignField: 'student',
        as: 'scores',
      },
    },
    {
      $addFields: {
        additional_score: {
          $sum: '$scores.score',
        },
        probs_score: {
          $sum: '$solvedprobs.score',
        },
      },
    },
    {
      $project: {
        solved: false,
        solvedprobs: false,
        scores: false,
      },
    },
    {
      $addFields: {
        score: {
          $sum: ['$additional_score', '$probs_score'],
        },
      },
    },
  ]);
};

// CASCADE 구현
// UserSchema.pre(
//   'remove',
//   async function (this: IUserSchema, next: HookNextFunction) {
//     try {
//       const post = await Post.remove({ owner: this._id });
//       const comment = await Comment.remove({ owner: this._id });
//       next();
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export default model<IStudentSchema>('Student', StudentSchema) as IStudentModel;