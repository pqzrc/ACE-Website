import { Router } from 'express';
import { z } from 'zod';
import timeSlotController from '../controllers/timeslot.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

const createTimeSlotSchema = z.object({
    roomName: z.string().min(1, 'Le nom de la salle est requis'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Format d\'heure invalide'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Format d\'heure invalide'),
    maxTeams: z.number().int().min(1).max(20).optional(),
});

const updateTimeSlotSchema = z.object({
    roomName: z.string().min(1).optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    maxTeams: z.number().int().min(1).max(20).optional(),
    isActive: z.boolean().optional(),
});

// Public route to get available time slots
router.get('/available', timeSlotController.getAvailableTimeSlots);

// Admin routes
router.use(protect); // All routes below require authentication

router.get('/admin', timeSlotController.getAllTimeSlots);
router.post('/', validate(createTimeSlotSchema), timeSlotController.createTimeSlot);
router.post('/assign-team', timeSlotController.assignTeamToTimeSlot);
router.put('/:id', validate(updateTimeSlotSchema), timeSlotController.updateTimeSlot);
router.delete('/:id', timeSlotController.deleteTimeSlot);

export default router;
