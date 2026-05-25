import { Queue, Worker, Job } from 'bullmq';
import { isRedisAvailable, getRedisClient } from '../config/db';
import { generateQuestionPaper } from '../services/aiService';
import { wsManager } from '../services/websocket';
import Assignment from '../models/Assignment';
import { GeneratedPaper } from '../types';

let generationQueue: Queue | null = null;
let generationWorker: Worker | null = null;

export function initializeQueue(): void {
  if (!isRedisAvailable()) {
    console.log('BullMQ queue not initialized — Redis unavailable. Using inline generation.');
    return;
  }

  const redisClient = getRedisClient();
  if (!redisClient) return;

  const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
  const connectionOptions = {
    maxRetriesPerRequest: null,
    tls: redisURL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
  };

  const Redis = require('ioredis');

  generationQueue = new Queue('question-generation', { 
    connection: new Redis(redisURL, connectionOptions) 
  });

  generationWorker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Processing generation job for assignment: ${assignmentId}`);

      try {
        // Broadcast start
        wsManager.broadcast('generation:started', { assignmentId });

        // Fetch assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          throw new Error('Assignment not found');
        }

        // Update progress
        await job.updateProgress(30);
        wsManager.broadcast('generation:progress', { assignmentId, progress: 30 });

        // Generate paper
        const paper = await generateQuestionPaper(assignment.toObject() as any);

        await job.updateProgress(80);
        wsManager.broadcast('generation:progress', { assignmentId, progress: 80 });

        // Save to DB
        assignment.generatedPaper = paper;
        assignment.status = 'completed';
        await assignment.save();

        // Cache in Redis
        const redis = getRedisClient();
        if (redis) {
          await redis.setex(`paper:${assignmentId}`, 3600, JSON.stringify(paper));
        }

        await job.updateProgress(100);
        wsManager.broadcast('generation:completed', {
          assignmentId,
          paper,
        });

        console.log(`Generation completed for assignment: ${assignmentId}`);
        return paper;
      } catch (error: any) {
        console.error(`Generation failed for assignment: ${assignmentId}`, error.message);

        // Update status to error
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'error' });

        wsManager.broadcast('generation:error', {
          assignmentId,
          error: error.message,
        });

        throw error;
      }
    },
    { connection }
  );

  generationWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  generationWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log('BullMQ queue and worker initialized');
}

export async function addGenerationJob(assignmentId: string): Promise<string> {
  // Force inline generation for the deployed demo to avoid free-tier Redis timeouts hanging the queue
  console.log('Running generation inline (bypassing Redis queue for reliability)');
  runInlineGeneration(assignmentId);
  return assignmentId;
}

async function runInlineGeneration(assignmentId: string): Promise<void> {
  try {
    wsManager.broadcast('generation:started', { assignmentId });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    wsManager.broadcast('generation:progress', { assignmentId, progress: 30 });

    const paper = await generateQuestionPaper(assignment.toObject() as any);

    wsManager.broadcast('generation:progress', { assignmentId, progress: 80 });

    assignment.generatedPaper = paper;
    assignment.status = 'completed';
    await assignment.save();

    wsManager.broadcast('generation:completed', { assignmentId, paper });

    console.log(`Inline generation completed for: ${assignmentId}`);
  } catch (error: any) {
    console.error(`Inline generation failed:`, error.message);
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'error' });
    wsManager.broadcast('generation:error', { assignmentId, error: error.message });
  }
}

export function shutdownQueue(): void {
  if (generationWorker) generationWorker.close();
  if (generationQueue) generationQueue.close();
}
