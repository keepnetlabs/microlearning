import { useCallback } from 'react';
import { createSCORMZipBlob, generateSCORMHTML, generateSCORMManifest } from '../utils/scormDownload';
import { languages } from '../components/api/languages';

interface UploadTrainingParams {
  appConfig: any;
  accessToken: string;
  baseApiUrl: string;
  baseUrl: string;
}

// Helper function to parse JWT token and extract company ID
const parseJWT = (token: string): { companyId?: string; [key: string]: any } => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format');
      return {};
    }

    // Decode payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};

// Helper function to get language resourceId from appConfig language code
const getLanguageResourceId = (appConfig: any): string => {
  try {
    // Get language code from appConfig - try different possible field names
    const languageCode = appConfig?.language_code ||
                         appConfig?.languageCode ||
                         appConfig?.language ||
                         appConfig?.selectedLanguage ||
                         'en';

    // Find matching language in languages array
    const language = languages.find(
      (lang: any) =>
        lang.code === languageCode ||
        lang.isoCode === languageCode ||
        lang.description === languageCode?.toUpperCase() ||
        lang.name?.toLowerCase() === languageCode?.toLowerCase()
    );

    if (language?.resourceId) {
      console.log(`Found language resourceId: ${language.resourceId} for code: ${languageCode}`);
      return language.resourceId;
    }

    // Default fallback - English
    const englishLang = languages.find((lang: any) => lang.code === '0');
    console.warn(`Language code ${languageCode} not found, using English default`);
    return englishLang?.resourceId || '862249c19aad';
  } catch (error) {
    console.error('Error getting language resourceId:', error);
    // Default English resourceId
    return '862249c19aad';
  }
};

export const useUploadTraining = () => {
  const uploadTraining = useCallback(async (params: UploadTrainingParams) => {
    const { appConfig, accessToken, baseApiUrl, baseUrl } = params;

    // Parse JWT token to extract company ID
    const tokenPayload = parseJWT(accessToken);
    const companyId = tokenPayload?.user_company_resourceid || tokenPayload?.companyId || tokenPayload?.company_id || 'UNKNOWN';

    // Static API key
    const apiKey = 'apikey';

    // Clean category and targetAudience
    const category = (appConfig?.category || 'TravelSecurity').trim().replace(/\s+/g, '');
    const rolesInput = appConfig?.roles || 'AllEmployees';
    const targetAudience = Array.isArray(rolesInput)
      ? rolesInput.join('').replace(/\s+/g, '')
      : (rolesInput || 'AllEmployees').toString().trim().replace(/\s+/g, '');

    try {
      // Step 1: Create training draft
      const trainingDraftPayload = {
        name: appConfig?.microlearning_metadata?.title || 'Untitled Training',
        description: appConfig?.microlearning_metadata?.description || '',
        category: category,
        targetAudience: targetAudience,
        availableForRequests: [
          {
            id: 'MyCompanyOnly',
            label: 'My company only',
            type: 'MyCompanyOnly',
            resourceId: null
          }
        ],
        compliances: [],
        behaviours: []
      };

      console.log('Training draft payload:', trainingDraftPayload);

      const draftEndpoint = `${baseApiUrl}/api/trainings/draft`;
      console.log('Draft endpoint:', draftEndpoint);

      const draftResponse = await fetch(draftEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-IR-API-KEY': apiKey,
          'X-IR-COMPANY-ID': companyId
        },
        body: JSON.stringify(trainingDraftPayload)
      });

      console.log('Draft response status:', draftResponse.status);
      const draftData = await draftResponse.json();
      console.log('Draft response data:', draftData);

      if (!draftResponse.ok) {
        throw new Error('Failed to create training draft');
      }

      // Step 2: Extract resourceId from response
      const resourceId = draftData?.data?.resourceId;
      console.log('Resource ID:', resourceId);

      if (!resourceId) {
        throw new Error('No resourceId in response');
      }

      console.log('Training draft created successfully!');
      console.log('Ready for SCORM upload with resourceId:', resourceId);

      // Step 3: Create SCORM package
      const courseTitle = appConfig?.microlearning_metadata?.title || 'Microlearning Course';

      console.log('Generating SCORM HTML...');
      const scormHTML = generateSCORMHTML(baseUrl, courseTitle);

      console.log('Generating SCORM manifest...');
      const imsmanifestXML = generateSCORMManifest(courseTitle);

      console.log('Creating SCORM ZIP blob...');
      const scormBlob = await createSCORMZipBlob(scormHTML, imsmanifestXML, courseTitle);
      console.log('SCORM ZIP blob created, size:', scormBlob.size);

      // Step 4: Upload SCORM package
      const languageResourceId = getLanguageResourceId(appConfig);

      const formData = new FormData();
      formData.append('zipFile', scormBlob, `${courseTitle.replace(/\s+/g, '-').toLowerCase()}-scorm-package.zip`);
      formData.append('languageId', languageResourceId);
      formData.append('vendorId', 'db0b6e2d-d878-4794-9263-84649a7528c8');

      const uploadContentEndpoint = `${baseApiUrl}/api/trainings/${resourceId}/upload-content`;
      console.log('Upload content endpoint:', uploadContentEndpoint);

      const uploadResponse = await fetch(uploadContentEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-IR-API-KEY': apiKey,
          'X-IR-COMPANY-ID': companyId
        },
        body: formData
      });

      console.log('Upload response status:', uploadResponse.status);
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload SCORM package');
      }

      console.log('SCORM package uploaded successfully!');

      // Step 5: Update training metadata
      const metadataPayload = new FormData();
      metadataPayload.append('coverImage', 'null');
      metadataPayload.append('trainingDetail.name', appConfig?.microlearning_metadata?.title || 'Untitled Training');
      metadataPayload.append('trainingDetail.description', appConfig?.microlearning_metadata?.description || '');
      metadataPayload.append('trainingDetail.category', category);
      metadataPayload.append('trainingDetail.targetAudience', targetAudience);
      metadataPayload.append('trainingDetail.hasQuiz', 'false');
      metadataPayload.append('trainingDetail.type', 'SCORM12');
      metadataPayload.append('trainingDetail.vendorId', 'db0b6e2d-d878-4794-9263-84649a7528c8');
      metadataPayload.append('trainingDetail.availableForRequests[0].type', 'MyCompanyOnly');
      metadataPayload.append('trainingDetail.availableForRequests[0].resourceId', 'null');

      const metadataEndpoint = `${baseApiUrl}/api/trainings/${resourceId}`;
      console.log('Metadata endpoint:', metadataEndpoint);

      const metadataResponse = await fetch(metadataEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-IR-API-KEY': apiKey,
          'X-IR-COMPANY-ID': companyId
        },
        body: metadataPayload
      });

      console.log('Metadata response status:', metadataResponse.status);
      const metadataResult = await metadataResponse.json();
      console.log('Metadata result:', metadataResult);

      if (!metadataResponse.ok) {
        throw new Error('Failed to update training metadata');
      }

      console.log('Training metadata updated successfully!');
      return {
        success: true,
        resourceId,
        message: 'Training created, SCORM uploaded, and metadata updated successfully!'
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  return { uploadTraining };
};
