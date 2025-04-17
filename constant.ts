import { Code } from 'aws-cdk-lib/aws-lambda';
import { join, sep } from 'path';

let currentDir = __dirname;
const filePath = currentDir.split(sep);
if (filePath[filePath.length - 1] === 'dist') {
    filePath.pop();
    currentDir = filePath.join(sep);
}

export const rootDir = currentDir;


export function getCodeAsset(lambdaName: string) {
    console.log(join(rootDir, `dist/packages/backend/${lambdaName}`))
    return Code.fromAsset(join(rootDir, `dist/packages/backend/${lambdaName}`));
}
