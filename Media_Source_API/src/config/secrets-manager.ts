import {
  GetSecretValueCommand,
  SecretsManagerClient,
  PutSecretValueCommand,
  CreateSecretCommand
} from "@aws-sdk/client-secrets-manager";

export const getSecretValue = async (secretName = "SECRET_NAME") => {
  const client = new SecretsManagerClient(
                {region: process.env.AWS_DEFAULT_REGION,credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },});
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  // {
  //   '$metadata': {
  //     httpStatusCode: 200,
  //     requestId: '584eb612-f8b0-48c9-855e-6d246461b604',
  //     extendedRequestId: undefined,
  //     cfId: undefined,
  //     attempts: 1,
  //     totalRetryDelay: 0
  //   },
  //   ARN: 'arn:aws:secretsmanager:us-east-1:xxxxxxxxxxxx:secret:binary-secret-3873048-xxxxxx',
  //   CreatedDate: 2023-08-08T19:29:51.294Z,
  //   Name: 'binary-secret-3873048',
  //   SecretBinary: Uint8Array(11) [
  //      98, 105, 110, 97, 114,
  //     121,  32, 100, 97, 116,
  //      97
  //   ],
  //   VersionId: '712083f4-0d26-415e-8044-16735142cd6a',
  //   VersionStages: [ 'AWSCURRENT' ]
  // }

  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }

  if (response.SecretBinary) {
    return response.SecretBinary;
  }
};

export async function upsertSecret(secretId: string, value: unknown) {
  const sm = new SecretsManagerClient(
    {region: process.env.AWS_DEFAULT_REGION,credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },}
  );
  try {
    // Try adding new version
    await sm.send(
      new PutSecretValueCommand({
        SecretId: secretId,
        SecretString: JSON.stringify(value),
      })
    );
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      // Secret doesn't exist yet → create it
      await sm.send(
        new CreateSecretCommand({
          Name: secretId,
          SecretString: JSON.stringify(value),
        })
      );
    } else {
      throw err;
    }
  }
}
