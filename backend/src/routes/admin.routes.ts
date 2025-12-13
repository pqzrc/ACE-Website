import { Router } from 'express';
import { z } from 'zod';
import adminController from '../controllers/admin.controller';
import ctfdController from '../controllers/ctfd.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Route publique pour la synchronisation CTFd (protégée par mot de passe)
router.patch('/ctfd/sync', ctfdController.syncTeams);

// Toutes les autres routes nécessitent une authentification admin
router.use(protect, adminOnly);

const assignRoomsSchema = z.object({
  assignments: z.array(
    z.object({
      teamId: z.string().uuid(),
      roomNumber: z.number().min(0),
    })
  ),
});

const sessionSchema = z.object({
  roomNumber: z.number().min(1).max(4),
});

const exportCSVSchema = z.object({
  fields: z.array(z.string()).min(1, 'Au moins un champ doit être sélectionné'),
});

// Statistiques et données
router.get('/stats', adminController.getStats);
router.get('/registrations', adminController.getRegistrations);
router.get('/teams', adminController.getAllTeams);
router.get('/scores', adminController.getScores);
router.get('/export/csv', adminController.exportCSV);
router.post('/export/csv', validate(exportCSVSchema), adminController.exportCustomCSV);

// Gestion des salles
router.post('/rooms/assign', validate(assignRoomsSchema), adminController.assignRooms);
router.get('/rooms/names', adminController.getRoomNames);
router.post('/rooms/names', adminController.updateRoomName);
router.post('/rooms', adminController.addRoom);
router.delete('/rooms/:roomNumber', adminController.deleteRoom);

const addMemberSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  userEmail: z.string().email().optional(),
}).refine(data => data.userId || data.userEmail, {
  message: "Either userId or userEmail must be provided"
});

const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
  captainEmail: z.string().email().optional(),
  timeSlotId: z.string().uuid().optional(),
});

const assignTimeSlotSchema = z.object({
  teamId: z.string().uuid(),
  timeSlotId: z.string().uuid().nullable(),
});

// Gestion des utilisateurs et équipes
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/teams/create', validate(createTeamSchema), adminController.createTeamWithCaptain);
router.patch('/teams/:teamId', adminController.updateTeam);
router.post('/teams/add-member', validate(addMemberSchema), adminController.addMemberToTeam);
router.post('/teams/assign-timeslot', validate(assignTimeSlotSchema), adminController.assignTeamTimeSlot);
router.delete('/teams/:teamId', adminController.deleteTeam);

// CTFd integration
router.post('/ctfd/sync-scores', ctfdController.syncScores);
router.get('/ctfd/health', ctfdController.healthCheck);
router.get('/ctfd/scoreboard', ctfdController.getScoreboard);

export default router;

