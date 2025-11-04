// Migrated to Supabase - Using Edge Functions for integrations
import { callEdgeFunction } from './supabaseClient';

// Wrapper functions to maintain backward compatibility
export const InvokeLLM = async (params) => {
  return await callEdgeFunction('invokeLLM', params);
};

export const SendEmail = async (params) => {
  return await callEdgeFunction('sendEmail', params);
};

export const UploadFile = async (params) => {
  return await callEdgeFunction('uploadFile', params);
};

export const GenerateImage = async (params) => {
  return await callEdgeFunction('generateImage', params);
};

export const ExtractDataFromUploadedFile = async (params) => {
  return await callEdgeFunction('extractDataFromFile', params);
};

export const CreateFileSignedUrl = async (params) => {
  return await callEdgeFunction('createFileSignedUrl', params);
};

export const UploadPrivateFile = async (params) => {
  return await callEdgeFunction('uploadPrivateFile', params);
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






