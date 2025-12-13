import { Router } from 'express';
import publicController from '../controllers/public.controller';

const router = Router();

// Routes publiques (sans authentification)
// /leaderboard inclut automatiquement la config de l'événement
router.get('/leaderboard', publicController.getLeaderboard);
router.get('/rooms', publicController.getRoomNames);

export default router;

