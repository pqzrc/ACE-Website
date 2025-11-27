import { Router } from 'express';
import { z } from 'zod';
import teamController from '../controllers/team.controller';
import { protect, emailVerified } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(3, 'Le nom d\'équipe doit contenir au moins 3 caractères').max(50),
  timeSlotId: z.string().uuid('ID de créneau invalide').optional(),
});

const joinTeamSchema = z.object({
  inviteCode: z.string().length(6, 'Code invalide'),
});

const joinAvailableTeamSchema = z.object({
  timeSlotId: z.string().refine(
    (val) => val === 'no-slot' || z.string().uuid().safeParse(val).success,
    'ID de créneau invalide'
  ),
});

const updateTimeSlotSchema = z.object({
  timeSlotId: z.string().uuid('ID de créneau invalide').nullable(),
});

// Routes qui ne nécessitent que l'authentification (pas de vérification email requise)
router.get('/available', protect, teamController.getAvailableTeams);
router.get('/my-team', protect, teamController.getMyTeam);
router.get('/:id', protect, teamController.getTeam);

// Routes qui nécessitent authentification + email vérifié
router.post('/create', protect, emailVerified, validate(createTeamSchema), teamController.createTeam);
router.post('/join', protect, emailVerified, validate(joinTeamSchema), teamController.joinTeam);
router.post('/join-available', protect, emailVerified, validate(joinAvailableTeamSchema), teamController.joinAvailableTeam);
router.patch('/update-timeslot', protect, emailVerified, validate(updateTimeSlotSchema), teamController.updateTeamTimeSlot);
router.post('/leave', protect, emailVerified, teamController.leaveTeam);

export default router;


