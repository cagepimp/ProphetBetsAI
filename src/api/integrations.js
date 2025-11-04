// Edge Functions are not yet deployed
// These integrations will be implemented once Edge Functions are set up

const notImplemented = (functionName) => {
  throw new Error(`Edge Functions are not yet deployed. ${functionName} is not available.`);
};

// Wrapper functions to maintain backward compatibility
export const InvokeLLM = async (params) => {
  notImplemented('invokeLLM');
};

export const SendEmail = async (params) => {
  notImplemented('sendEmail');
};

export const UploadFile = async (params) => {
  notImplemented('uploadFile');
};

export const GenerateImage = async (params) => {
  notImplemented('generateImage');
};

export const ExtractDataFromUploadedFile = async (params) => {
  notImplemented('extractDataFromFile');
};

export const CreateFileSignedUrl = async (params) => {
  notImplemented('createFileSignedUrl');
};

export const UploadPrivateFile = async (params) => {
  notImplemented('uploadPrivateFile');
};

// Core export for backward compatibility
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile
};






