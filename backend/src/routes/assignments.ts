import { Router, Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { addGenerationJob } from '../queues/generationQueue';
import { getRedisClient, isRedisAvailable } from '../config/db';
import { wsManager } from '../services/websocket';

const router = Router();

// POST /api/assignments — Create assignment
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subject, className, school, dueDate, questionTypes, totalMarks, timeAllowed, additionalInstructions, fileUrl } = req.body;

    // Validation
    if (!title || !subject || !className || !school || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields: title, subject, className, school, dueDate' });
    }

    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: 'At least one question type is required' });
    }

    for (const qt of questionTypes) {
      if (!qt.type || qt.count < 1 || qt.marks < 1) {
        return res.status(400).json({ error: 'Invalid question type: type is required, count and marks must be >= 1' });
      }
    }

    const computedTotalMarks = totalMarks || questionTypes.reduce((sum: number, qt: any) => sum + qt.count * qt.marks, 0);

    const assignment = new Assignment({
      title,
      subject,
      className,
      school,
      dueDate,
      questionTypes,
      totalMarks: computedTotalMarks,
      timeAllowed: timeAllowed || 60,
      additionalInstructions: additionalInstructions || '',
      fileUrl: fileUrl || '',
      status: 'draft',
    });

    const saved = await assignment.save();
    console.log(`Assignment created: ${saved._id} — "${title}"`);

    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error creating assignment:', error.message);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// GET /api/assignments — List all assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let query: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const assignments = await Assignment.find(query)
      .select('-generatedPaper')
      .sort({ createdAt: -1 })
      .lean();

    res.json(assignments);
  } catch (error: any) {
    console.error('Error fetching assignments:', error.message);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id — Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    if (isRedisAvailable()) {
      const redis = getRedisClient();
      if (redis) {
        const cached = await redis.get(`paper:${id}`);
        if (cached) {
          const assignment = await Assignment.findById(id).lean();
          if (assignment) {
            return res.json({
              ...assignment,
              generatedPaper: JSON.parse(cached),
            });
          }
        }
      }
    }

    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error: any) {
    console.error('Error fetching assignment:', error.message);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// DELETE /api/assignments/:id — Delete assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Clear Redis cache
    if (isRedisAvailable()) {
      const redis = getRedisClient();
      if (redis) {
        await redis.del(`paper:${id}`);
      }
    }

    console.log(`  Assignment deleted: ${id}`);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting assignment:', error.message);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// POST /api/assignments/:id/generate — Trigger AI generation
router.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Set status to generating
    assignment.status = 'generating';
    await assignment.save();

    // Add to queue
    const jobId = await addGenerationJob(id);

    console.log(` Generation started for assignment: ${id}, job: ${jobId}`);
    res.json({ jobId, message: 'Generation started', assignmentId: id });
  } catch (error: any) {
    console.error('Error starting generation:', error.message);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

// GET /api/assignments/:id/status — Check generation status
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).select('status').lean();
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ status: assignment.status, assignmentId: id });
  } catch (error: any) {
    console.error('Error checking status:', error.message);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;
