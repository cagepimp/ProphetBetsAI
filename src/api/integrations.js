// Supabase integrations via Edge Functions
import { callEdgeFunction } from './supabaseClient';

/**
 * Invoke an LLM (Large Language Model) via Edge Function
 * @param {Object} params - LLM invocation parameters
 * @returns {Promise<Object>} LLM response
 */
export const InvokeLLM = async (params) => {
  return await callEdgeFunction('invokeLLM', params, {
    timeout: 120000, // 2 minutes for LLM responses
    retries: 1
  });
};

/**
 * Send an email via Edge Function
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Send result
 */
export const SendEmail = async (params) => {
  return await callEdgeFunction('sendEmail', params, {
    timeout: 30000,
    retries: 2
  });
};

/**
 * Upload a file via Edge Function
 * @param {Object} params - File upload parameters
 * @returns {Promise<Object>} Upload result
 */
export const UploadFile = async (params) => {
  return await callEdgeFunction('uploadFile', params, {
    timeout: 120000, // 2 minutes for file uploads
    retries: 1
  });
};

/**
 * Generate an image via Edge Function
 * @param {Object} params - Image generation parameters
 * @returns {Promise<Object>} Generated image result
 */
export const GenerateImage = async (params) => {
  return await callEdgeFunction('generateImage', params, {
    timeout: 180000, // 3 minutes for image generation
    retries: 0
  });
};

/**
 * Extract data from an uploaded file
 * @param {Object} params - File extraction parameters
 * @returns {Promise<Object>} Extracted data
 */
export const ExtractDataFromUploadedFile = async (params) => {
  return await callEdgeFunction('extractDataFromFile', params, {
    timeout: 60000,
    retries: 1
  });
};

/**
 * Create a signed URL for a file
 * @param {Object} params - Signed URL parameters
 * @returns {Promise<Object>} Signed URL result
 */
export const CreateFileSignedUrl = async (params) => {
  return await callEdgeFunction('createFileSignedUrl', params, {
    timeout: 10000,
    retries: 2
  });
};

/**
 * Upload a private file
 * @param {Object} params - Private file upload parameters
 * @returns {Promise<Object>} Upload result
 */
export const UploadPrivateFile = async (params) => {
  return await callEdgeFunction('uploadPrivateFile', params, {
    timeout: 120000,
    retries: 1
  });
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






