import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Function to process the avatar with voice
function processAvatarWithVoice(userId: string, videoUrl: string) {
  saveAvatarToDB(userId, videoUrl);
  integrateAvatarIntoMomentsWithVoice(userId, videoUrl);
}

// Function to process the Premium+ avatar
function processPremiumAvatar(userId: string, avatarUrl: string) {
  saveAvatarToDB(userId, avatarUrl);
  integratePremiumAvatarIntoMoments(userId, avatarUrl);
}

// Function to process the Express avatar
function processExpressAvatar(userId: string, avatarUrl: string) {
  saveAvatarToDB(userId, avatarUrl);
  integrateExpressAvatarIntoMoments(userId, avatarUrl);
}

// Function to process the verified consent
function processVerifiedConsent(consentId: string, resultUrl: string, userId: string) {
  console.log(`Consent ID ${consentId} has been verified for user ${userId}.`);
  console.log(`Result URL: ${resultUrl}`);
  // Additional logic to handle verified consent (e.g., update database, notify user)
}

// Function to save avatar details in the databasegit
function saveAvatarToDB(userId: string, url: string) {
  console.log(`Saving avatar URL ${url} for user ${userId}`);
  // Database save logic here
}

// Function to integrate the avatar with voice into Moments
function integrateAvatarIntoMomentsWithVoice(userId: string, videoUrl: string) {
  console.log(`Integrating avatar with voice for user ${userId} into Moments.`);
  // Logic to associate the avatar video with Moments
}

// Function to integrate the Premium+ avatar into Moments
function integratePremiumAvatarIntoMoments(userId: string, avatarUrl: string) {
  console.log(`Integrating Premium+ avatar for user ${userId} into Moments.`);
  // Logic to associate the Premium+ avatar with Moments
}

// Function to integrate the Express avatar into Moments
function integrateExpressAvatarIntoMoments(userId: string, avatarUrl: string) {
  console.log(`Integrating Express avatar for user ${userId} into Moments.`);
  // Logic to associate the Express avatar with Moments
}

// Webhook route handler
export async function webhookRoute(fastify: FastifyInstance) {
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const { event, data } = request.body as { event: string; data: any };

    console.log(`Received event: ${event}`);

    switch (event) {
      case 'video.completed':
        const { user_id: videoUserId, operation: videoOperation } = data.metadata;
        const { result_url: videoUrl } = data;

        console.log(`Avatar with voice created for user: ${videoUserId}`); //only for video complted testing 
        console.log(`Video available at: ${videoUrl}`); //only for video.completed event testing 

        // Trigger next process for simple avatar
        processAvatarWithVoice(videoUserId, videoUrl);
        break;

      case 'avatar.completed':
        const { user_id: premiumUserId, operation: premiumOperation } = data.metadata;
        const { avatar_url: premiumAvatarUrl } = data;

        console.log(`Premium+ avatar created for user: ${premiumUserId}`);
        console.log(`Avatar available at: ${premiumAvatarUrl}`);

        // Trigger next process for Premium+ avatar
        processPremiumAvatar(premiumUserId, premiumAvatarUrl);
        break;

      case 'express.avatar.completed':
        const { user_id: expressUserId, operation: expressOperation } = data.metadata;
        const { avatar_url: expressAvatarUrl } = data;

        console.log(`Express avatar created for user: ${expressUserId}`);
        console.log(`Avatar available at: ${expressAvatarUrl}`);

        // Trigger next process for Express avatar
        processExpressAvatar(expressUserId, expressAvatarUrl);
        break;

      case 'consent.verified':
        const { consent_id, result_url, metadata } = data;
        const { user_id: consentUserId } = metadata;

        console.log(`Consent ID ${consent_id} has been verified for user ${consentUserId}.`);
        console.log(`Result URL: ${result_url}`);

        // Trigger next process for verified consent
        processVerifiedConsent(consent_id, result_url, consentUserId);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
        break;
    }

    reply.status(200).send('Webhook received successfully.');
  });
}