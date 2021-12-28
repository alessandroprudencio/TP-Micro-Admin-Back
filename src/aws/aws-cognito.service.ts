import { Injectable } from '@nestjs/common';
import { CognitoUserAttribute, CognitoUserPool, ISignUpResult } from 'amazon-cognito-identity-js';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AwsCognitoConfig } from './aws-cognito.config';

@Injectable()
export class AwsCognitoService {
  private userPool: CognitoUserPool;
  constructor(private cognitoConfig: AwsCognitoConfig) {
    this.cognitoConfig = cognitoConfig;

    this.userPool = new CognitoUserPool({
      UserPoolId: this.cognitoConfig.userPoolId,
      ClientId: this.cognitoConfig.clientId,
    });
  }

  register(userDto: any): Promise<ISignUpResult> {
    return new Promise<ISignUpResult>((resolve, reject) => {
      const { name, email, password, phoneNumber, id } = userDto;

      const attributeList = [];

      attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: name }));
      attributeList.push(new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNumber }));
      attributeList.push(new CognitoUserAttribute({ Name: 'custom:_id', Value: id }));
      // attributeList.push(new CognitoUserAttribute({ Name: 'is_admin', Value: '0' }));

      this.userPool.signUp(email, password, attributeList, null, async (err, result: ISignUpResult) => {
        if (err) return reject(err);

        try {
          const params = {
            GroupName: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
            UserPoolId: this.userPool.getUserPoolId(),
            Username: result.userSub,
          };

          const cognito = new CognitoIdentityServiceProvider({ region: this.cognitoConfig.region });

          await cognito.adminAddUserToGroup(params).promise();
        } catch (error) {
          reject(error);
        }

        return resolve(result);
      });
    });
  }

  async deleteFromAdmin(sub: string) {
    const cognito = new CognitoIdentityServiceProvider({ region: this.cognitoConfig.region });

    await cognito
      .adminDeleteUser({
        UserPoolId: this.cognitoConfig.userPoolId,
        Username: sub,
      })
      .promise();
  }
}
